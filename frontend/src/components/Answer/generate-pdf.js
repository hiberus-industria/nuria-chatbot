import { jsPDF } from 'jspdf'

const OutputType = {
  Save: 'save',
  DataUriString: 'datauristring',
  DataUri: 'datauri',
  DataUrlNewWindow: 'dataurlnewwindow',
  Blob: 'blob',
  ArrayBuffer: 'arraybuffer'
}

export { OutputType, jsPDF }

/**
 * @param { {
 *   outputType: OutputType | string,
 *   onJsPDFDocCreation?: (doc: jsPDF) => void,
 *   returnJsPDFDocObject?: boolean,
 *   fileName: string,
 *   orientationLandscape?: boolean,
 *   compress?: boolean,
 *   logo?: { src?: string, type?: string, width?: number, height?: number, margin?: { top?: number, left?: number } },
 *   stamp?: { inAllPages?: boolean, src?: string, type?: string, width?: number, height?: number, margin?: { top?: number, left?: number } },
 *   business?: { name?: string, address?: string, phone?: string, email?: string, email_1?: string, website?: string },
 *   contact?: { label?: string, name?: string, address?: string, phone?: string, email?: string, otherInfo?: string },
 *   invoice?: {
 *     label?: string,
 *     num?: number,
 *     invDate?: string,
 *     invGenDate?: string,
 *     headerBorder?: boolean,
 *     tableBodyBorder?: boolean,
 *     header?: { title: string, style?: { width?: number }, type?: 'text' | 'image' }[],
 *     table?: any[][],
 *     invDescLabel?: string,
 *     invDesc?: string,
 *     additionalRows?: { col1?: string, col2?: string, col3?: string, style?: { fontSize?: number } }[],
 *     resolveImageUrl?: (url: string) => Promise<string>
 *   },
 *   footer?: { text?: string },
 *   pageEnable?: boolean,
 *   pageLabel?: string
 * } } props
 */
async function jsPDFInvoiceTemplate(props) {
  const param = {
    outputType: props.outputType || 'save',
    onJsPDFDocCreation: props.onJsPDFDocCreation || null,
    returnJsPDFDocObject: props.returnJsPDFDocObject || false,
    fileName: props.fileName || '',
    orientationLandscape: props.orientationLandscape || false,
    compress: props.compress || false,
    logo: {
      src: props.logo?.src || '',
      type: props.logo?.type || '',
      width: props.logo?.width || '',
      height: props.logo?.height || '',
      margin: { top: props.logo?.margin?.top || 0, left: props.logo?.margin?.left || 0 }
    },
    stamp: {
      inAllPages: props.stamp?.inAllPages || false,
      src: props.stamp?.src || '',
      width: props.stamp?.width || '',
      height: props.stamp?.height || '',
      margin: { top: props.stamp?.margin?.top || 0, left: props.stamp?.margin?.left || 0 }
    },
    business: {
      name: props.business?.name || '',
      address: props.business?.address || '',
      phone: props.business?.phone || '',
      email: props.business?.email || '',
      email_1: props.business?.email_1 || '',
      website: props.business?.website || ''
    },
    contact: {
      label: props.contact?.label || '',
      name: props.contact?.name || '',
      address: props.contact?.address || '',
      phone: props.contact?.phone || '',
      email: props.contact?.email || '',
      otherInfo: props.contact?.otherInfo || ''
    },
    invoice: {
      label: props.invoice?.label || '',
      num: props.invoice?.num || '',
      invDate: props.invoice?.invDate || '',
      invGenDate: props.invoice?.invGenDate || '',
      headerBorder: props.invoice?.headerBorder || false,
      tableBodyBorder: props.invoice?.tableBodyBorder || false,
      header: props.invoice?.header || [],
      table: props.invoice?.table || [],
      invDescLabel: props.invoice?.invDescLabel || '',
      invDesc: props.invoice?.invDesc || '',
      additionalRows:
        props.invoice?.additionalRows?.map(x => ({
          col1: x?.col1 || '',
          col2: x?.col2 || '',
          col3: x?.col3 || '',
          style: { fontSize: x?.style?.fontSize || 12 }
        })) || [],
      resolveImageUrl: props.invoice?.resolveImageUrl || (url => Promise.resolve(''))
    },
    footer: { text: props.footer?.text || '' },
    pageEnable: props.pageEnable || false,
    pageLabel: props.pageLabel || 'Page'
  }

  const splitTextAndGetHeight = (text, size) => {
    var lines = doc.splitTextToSize(text, size)
    return { text: lines, height: doc.getTextDimensions(lines).h }
  }

  if (param.invoice.table && param.invoice.table.length) {
    if (param.invoice.table[0].length !== param.invoice.header.length) {
      throw Error('Length of header and table column must be equal.')
    }
  }

  const options = {
    orientation: param.orientationLandscape ? 'landscape' : '',
    compress: param.compress
  }

  var doc = new jsPDF(options)
  props.onJsPDFDocCreation && props.onJsPDFDocCreation(doc)

  var docWidth = doc.internal.pageSize.width
  var docHeight = doc.internal.pageSize.height

  var colorBlack = '#000000'
  var colorGray = '#4d4e53'
  var currentHeight = 15

  var pdfConfig = {
    headerTextSize: 20,
    labelTextSize: 12,
    fieldTextSize: 10,
    lineHeight: 6,
    subLineHeight: 4
  }

  doc.setFontSize(pdfConfig.headerTextSize)
  doc.setTextColor(colorBlack)
  doc.text(docWidth - 10, currentHeight, param.business.name, 'right')
  doc.setFontSize(pdfConfig.fieldTextSize)

  if (param.logo.src) {
    var imageHeader = typeof window === 'undefined' ? param.logo.src : new Image()
    if (typeof imageHeader !== 'string') imageHeader.src = param.logo.src
    doc.addImage(
      imageHeader,
      param.logo.type || undefined,
      10 + param.logo.margin.left,
      currentHeight - 5 + param.logo.margin.top,
      param.logo.width,
      param.logo.height
    )
  }

  doc.setTextColor(colorGray)
  currentHeight += pdfConfig.subLineHeight * 2
  doc.text(docWidth - 10, currentHeight, param.business.address, 'right')
  currentHeight += pdfConfig.subLineHeight
  doc.text(docWidth - 10, currentHeight, param.business.phone, 'right')
  currentHeight += pdfConfig.subLineHeight
  doc.text(docWidth - 10, currentHeight, param.business.email, 'right')
  currentHeight += pdfConfig.subLineHeight
  doc.text(docWidth - 10, currentHeight, param.business.email_1, 'right')
  currentHeight += pdfConfig.subLineHeight
  doc.text(docWidth - 10, currentHeight, param.business.website, 'right')

  if (param.invoice.header.length) {
    currentHeight += pdfConfig.subLineHeight
    doc.line(10, currentHeight, docWidth - 10, currentHeight)
  }

  doc.setTextColor(colorGray)
  doc.setFontSize(pdfConfig.fieldTextSize)
  currentHeight += pdfConfig.lineHeight
  if (param.contact.label) {
    doc.text(10, currentHeight, param.contact.label)
    currentHeight += pdfConfig.lineHeight
  }

  doc.setTextColor(colorBlack)
  doc.setFontSize(pdfConfig.headerTextSize - 5)
  if (param.contact.name) doc.text(10, currentHeight, param.contact.name)
  if (param.invoice.label && param.invoice.num) {
    doc.text(docWidth - 10, currentHeight, param.invoice.label + param.invoice.num, 'right')
  }
  if (param.contact.name || (param.invoice.label && param.invoice.num)) {
    currentHeight += pdfConfig.subLineHeight
  }

  doc.setTextColor(colorGray)
  doc.setFontSize(pdfConfig.fieldTextSize - 2)
  if (param.contact.address || param.invoice.invDate) {
    doc.text(10, currentHeight, param.contact.address)
    doc.text(docWidth - 10, currentHeight, param.invoice.invDate, 'right')
    currentHeight += pdfConfig.subLineHeight
  }
  if (param.contact.phone || param.invoice.invGenDate) {
    doc.text(10, currentHeight, param.contact.phone)
    doc.text(docWidth - 10, currentHeight, param.invoice.invGenDate, 'right')
    currentHeight += pdfConfig.subLineHeight
  }
  if (param.contact.email) {
    doc.text(10, currentHeight, param.contact.email)
    currentHeight += pdfConfig.subLineHeight
  }
  if (param.contact.otherInfo) {
    doc.text(10, currentHeight, param.contact.otherInfo)
  } else {
    currentHeight -= pdfConfig.subLineHeight
  }

  // TABLE PART
  var tdWidth = (doc.getPageWidth() - 20) / param.invoice.header.length

  if (param.invoice.header.length > 2) {
    const customColumnNo = param.invoice.header.map(x => x?.style?.width || 0).filter(x => x > 0)
    let customWidthOfAllColumns = customColumnNo.reduce((a, b) => a + b, 0)
    tdWidth =
      (doc.getPageWidth() - 20 - customWidthOfAllColumns) / (param.invoice.header.length - customColumnNo.length)
  }

  var addTableHeaderBorder = () => {
    currentHeight += 2
    const lineHeight = 7
    let startWidth = 0
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight)
      else {
        const previousTdWidth = param.invoice.header[i - 1]?.style?.width || tdWidth
        startWidth += previousTdWidth
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight)
      }
    }
    currentHeight -= 2
  }

  var addTableBodyBorder = lineHeight => {
    let startWidth = 0
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight)
      else {
        const previousTdWidth = param.invoice.header[i - 1]?.style?.width || tdWidth
        startWidth += previousTdWidth
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight)
      }
    }
  }

  var addTableHeader = () => {
    if (param.invoice.headerBorder) addTableHeaderBorder()
    currentHeight += pdfConfig.subLineHeight
    doc.setTextColor(colorBlack)
    doc.setFontSize(pdfConfig.fieldTextSize)
    doc.setDrawColor(colorGray)
    currentHeight += 2

    let startWidth = 0
    param.invoice.header.forEach(function (row, index) {
      if (index === 0) doc.text(row.title, 11, currentHeight)
      else {
        const previousTdWidth = param.invoice.header[index - 1]?.style?.width || tdWidth
        startWidth += previousTdWidth
        doc.text(row.title, startWidth + 11, currentHeight)
      }
    })

    currentHeight += pdfConfig.subLineHeight - 1
    doc.setTextColor(colorGray)
  }

  addTableHeader()

  // TABLE BODY (Modificado para esperar imágenes)
  var tableBodyLength = param.invoice.table.length
  for (let index = 0; index < tableBodyLength; index++) {
    const row = param.invoice.table[index]
    doc.line(10, currentHeight, docWidth - 10, currentHeight)

    var getRowsHeight = async function () {
      let rowsHeight = []
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const rr = row[colIndex]
        const widthToUse = param.invoice.header[colIndex]?.style?.width || tdWidth
        const isImageColumn = param.invoice.header[colIndex]?.type === 'image'
        if (isImageColumn && rr) {
          const imageUrl = rr.toString()
          const imageWidth = widthToUse - 2 // Ancho ajustado (margen de 1 mm a cada lado)
          let imageHeight = 8 // Altura inicial por defecto

          // Obtener la imagen en base64 y calcular su proporción
          const base64Image = await param.invoice.resolveImageUrl(imageUrl)
          if (base64Image) {
            try {
              // Crear una imagen temporal para obtener dimensiones reales
              const img = new Image()
              img.src = base64Image
              await new Promise(resolve => (img.onload = resolve))
              const aspectRatio = img.height / img.width
              imageHeight = imageWidth * aspectRatio // Ajustar altura proporcionalmente
            } catch (error) {
              console.error(`Error calculando proporción de imagen ${imageUrl}:`, error)
              imageHeight = imageWidth * 0.5 // Proporción por defecto si falla (1:2)
            }
          }
          rowsHeight.push(imageHeight)
        } else {
          let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1)
          rowsHeight.push(item.height)
        }
      }
      return rowsHeight
    }

    // Esperar a que se calculen las alturas
    const rowsHeight = await getRowsHeight()
    var maxHeight = Math.max(...rowsHeight)

    if (param.invoice.tableBodyBorder) addTableBodyBorder(maxHeight + 1)

    let startWidth = 0
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const rr = row[colIndex]
      const widthToUse = param.invoice.header[colIndex]?.style?.width || tdWidth
      const isImageColumn = param.invoice.header[colIndex]?.type === 'image'

      if (isImageColumn && rr) {
        const imageUrl = rr.toString()
        const imageHeight = rowsHeight[colIndex] // Usar la altura calculada
        const imageWidth = widthToUse - 2 // Ancho ajustado
        const imageX = 11 + startWidth
        const imageY = currentHeight + 1

        const base64Image = await param.invoice.resolveImageUrl(imageUrl)
        if (base64Image) {
          try {
            doc.addImage(base64Image, 'JPEG', imageX, imageY, imageWidth, imageHeight)
          } catch (error) {
            console.error(`Error al agregar imagen ${imageUrl}:`, error)
            doc.text('N/A', imageX, currentHeight + 4)
          }
        } else {
          doc.text('N/A', imageX, currentHeight + 4)
        }
      } else {
        let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1)
        if (colIndex === 0) {
          doc.text(item.text, 11, currentHeight + 4)
        } else {
          const previousTdWidth = param.invoice.header[colIndex - 1]?.style?.width || tdWidth
          startWidth += previousTdWidth
          doc.text(item.text, 11 + startWidth, currentHeight + 4)
        }
      }
    }

    currentHeight += maxHeight - 1
    currentHeight += 5

    if (index + 1 < tableBodyLength) currentHeight += maxHeight

    if (param.orientationLandscape && (currentHeight > 185 || (currentHeight > 178 && doc.getNumberOfPages() > 1))) {
      doc.addPage()
      currentHeight = 10
      if (index + 1 < tableBodyLength) addTableHeader()
    }

    if (!param.orientationLandscape && (currentHeight > 265 || (currentHeight > 255 && doc.getNumberOfPages() > 1))) {
      doc.addPage()
      currentHeight = 10
      if (index + 1 < tableBodyLength) addTableHeader()
    }

    if (index + 1 < tableBodyLength && currentHeight > 30) {
      currentHeight -= maxHeight
    }
  }

  var invDescSize = splitTextAndGetHeight(param.invoice.invDesc, docWidth / 2).height

  var checkAndAddPageLandscape = () => {
    if (!param.orientationLandscape && currentHeight + invDescSize > 270) {
      doc.addPage()
      currentHeight = 10
    }
  }

  var checkAndAddPageNotLandscape = (heightLimit = 173) => {
    if (param.orientationLandscape && currentHeight + invDescSize > heightLimit) {
      doc.addPage()
      currentHeight = 10
    }
  }

  var checkAndAddPage = () => {
    checkAndAddPageNotLandscape()
    checkAndAddPageLandscape()
  }

  var addStamp = () => {
    let _addStampBase = () => {
      var stampImage = typeof window === 'undefined' ? param.stamp.src : new Image()
      if (typeof stampImage !== 'string') stampImage.src = param.stamp.src
      doc.addImage(
        stampImage,
        param.stamp.type || undefined,
        10 + param.stamp.margin.left,
        docHeight - 22 + param.stamp.margin.top,
        param.stamp.width,
        param.stamp.height
      )
    }
    if (param.stamp.src) {
      if (param.stamp.inAllPages) _addStampBase()
      else if (!param.stamp.inAllPages && doc.getCurrentPageInfo().pageNumber === doc.getNumberOfPages())
        _addStampBase()
    }
  }

  checkAndAddPage()

  doc.setTextColor(colorBlack)
  doc.setFontSize(pdfConfig.labelTextSize)
  currentHeight += pdfConfig.lineHeight

  if (param.invoice.additionalRows?.length > 0) {
    doc.line(docWidth / 2, currentHeight, docWidth - 10, currentHeight)
    currentHeight += pdfConfig.lineHeight
    for (let i = 0; i < param.invoice.additionalRows.length; i++) {
      currentHeight += pdfConfig.lineHeight
      doc.setFontSize(param.invoice.additionalRows[i].style.fontSize)
      doc.text(docWidth / 1.5, currentHeight, param.invoice.additionalRows[i].col1, 'right')
      doc.text(docWidth - 25, currentHeight, param.invoice.additionalRows[i].col2, 'right')
      doc.text(docWidth - 10, currentHeight, param.invoice.additionalRows[i].col3, 'right')
      checkAndAddPage()
    }
  }

  checkAndAddPage()

  doc.setTextColor(colorBlack)
  currentHeight += pdfConfig.subLineHeight * 2
  doc.setFontSize(pdfConfig.labelTextSize)

  if (doc.getNumberOfPages() > 1) {
    for (let i = 1; i <= doc.getNumberOfPages(); i++) {
      doc.setFontSize(pdfConfig.fieldTextSize - 2)
      doc.setTextColor(colorGray)
      if (param.pageEnable) {
        doc.text(docWidth / 2, docHeight - 10, param.footer.text, 'center')
        doc.setPage(i)
        doc.text(
          param.pageLabel + ' ' + i + ' / ' + doc.getNumberOfPages(),
          docWidth - 20,
          doc.internal.pageSize.height - 6
        )
      }
      checkAndAddPageNotLandscape(183)
      checkAndAddPageLandscape()
      addStamp()
    }
  }

  var addInvoiceDesc = () => {
    doc.setFontSize(pdfConfig.labelTextSize)
    doc.setTextColor(colorBlack)
    doc.text(param.invoice.invDescLabel, 10, currentHeight)
    currentHeight += pdfConfig.subLineHeight
    doc.setTextColor(colorGray)
    doc.setFontSize(pdfConfig.fieldTextSize - 1)
    var lines = doc.splitTextToSize(param.invoice.invDesc, docWidth / 2)
    doc.text(lines, 10, currentHeight)
    currentHeight += doc.getTextDimensions(lines).h > 5 ? doc.getTextDimensions(lines).h + 6 : pdfConfig.lineHeight
    return currentHeight
  }
  addInvoiceDesc()

  addStamp()

  if (doc.getNumberOfPages() === 1 && param.pageEnable) {
    doc.setFontSize(pdfConfig.fieldTextSize - 2)
    doc.setTextColor(colorGray)
    doc.text(docWidth / 2, docHeight - 10, param.footer.text, 'center')
    doc.text(param.pageLabel + '1 / 1', docWidth - 20, doc.internal.pageSize.height - 6)
  }

  let returnObj = { pagesNumber: doc.getNumberOfPages() }
  if (param.returnJsPDFDocObject) {
    returnObj = { ...returnObj, jsPDFDocObject: doc }
  }

  if (param.outputType === 'save') {
    doc.save(param.fileName)
  } else if (param.outputType === 'blob') {
    returnObj = { ...returnObj, blob: doc.output('blob') }
  } else if (param.outputType === 'datauristring') {
    returnObj = { ...returnObj, dataUriString: doc.output('datauristring', { filename: param.fileName }) }
  } else if (param.outputType === 'arraybuffer') {
    returnObj = { ...returnObj, arrayBuffer: doc.output('arraybuffer') }
  } else {
    doc.output(param.outputType, { filename: param.fileName })
  }

  return returnObj
}

export default jsPDFInvoiceTemplate
