import { cloneDeep } from 'lodash'

import { AskResponse, Citation } from '../../api'

export type ParsedAnswer = {
  citations: Citation[]
  markdownFormatText: string
  generated_chart: string | null
} | null

export const enumerateCitations = (citations: Citation[]) => {
  const filepathMap = new Map()
  for (const citation of citations) {
    const { filepath } = citation
    let part_i = 1
    if (filepathMap.has(filepath)) {
      part_i = filepathMap.get(filepath) + 1
    }
    filepathMap.set(filepath, part_i)
    citation.part_index = part_i
  }
  return citations
}

export async function parseAnswer(
  answer: AskResponse,
  onJsonBlockStart?: () => void, // Callback when JSON block starts
  onJsonBlockEnd?: () => void // Callback when JSON block ends
): Promise<ParsedAnswer> {
  if (typeof answer.answer !== 'string') return null
  let answerText = answer.answer

  // Split the text into lines for incremental processing
  const lines = answerText.split('\n')
  let inJsonBlock = false
  let filteredLines: string[] = []

  for (const line of lines) {
    if (line.trim() === '```json') {
      // Start of JSON block detected
      inJsonBlock = true
      if (onJsonBlockStart) onJsonBlockStart() // Trigger loading indicator
      continue // Skip the ```json line
    } else if (line.trim() === '```' && inJsonBlock) {
      // End of JSON block detected
      inJsonBlock = false
      if (onJsonBlockEnd) onJsonBlockEnd() // Stop loading indicator
      continue // Skip the ``` line
    } else if (!inJsonBlock) {
      // Add non-JSON lines to the output
      filteredLines.push(line)
    }
    // If inJsonBlock is true, we ignore the line (JSON content)
  }

  // Reconstruct the text without JSON blocks
  answerText = filteredLines.join('\n').trim()
  // Clean up extra newlines
  answerText = answerText.replace(/\n{2,}/g, '\n\n')

  const citationLinks = answerText.match(/\[(doc\d\d?\d?)]/g)
  const lengthDocN = '[doc'.length

  let filteredCitations = [] as Citation[]
  let citationReindex = 0

  citationLinks?.forEach(link => {
    const citationIndex = link.slice(lengthDocN, link.length - 1)
    const citation = cloneDeep(answer.citations[Number(citationIndex) - 1]) as Citation
    if (!filteredCitations.find(c => c.id === citationIndex) && citation) {
      answerText = answerText.replaceAll(link, ` ^${++citationReindex}^ `)
      citation.id = citationIndex
      citation.reindex_id = citationReindex.toString()
      filteredCitations.push(citation)
    }
  })

  filteredCitations = enumerateCitations(filteredCitations)

  return {
    citations: filteredCitations,
    markdownFormatText: answerText,
    generated_chart: answer.generated_chart
  }
}
