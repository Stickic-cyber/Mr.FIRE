import html2canvas from "html2canvas"

export async function exportToImage(element: HTMLElement, fileName = "fire-results") {
  try {
    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement

    // Apply styles to ensure proper rendering
    clone.style.width = `${element.offsetWidth}px`
    clone.style.padding = "20px"

    // Use safer background and text color assignments
    const isDarkMode = document.documentElement.classList.contains("dark")
    clone.style.backgroundColor = isDarkMode ? "#1a1a1a" : "#ffffff"
    clone.style.color = isDarkMode ? "#ffffff" : "#000000"

    clone.style.borderRadius = "8px"
    clone.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"

    // Add watermark
    const watermark = document.createElement("div")
    watermark.style.position = "absolute"
    watermark.style.bottom = "10px"
    watermark.style.right = "10px"
    watermark.style.fontSize = "14px"
    watermark.style.fontWeight = "bold"
    watermark.style.opacity = "0.7"
    watermark.style.color = isDarkMode ? "#4ade80" : "#16a34a" // Green color for watermark
    watermark.textContent = "fire.stickic.top"
    clone.appendChild(watermark)

    // Temporarily append to body but hide it
    clone.style.position = "absolute"
    clone.style.left = "-9999px"
    document.body.appendChild(clone)

    // Generate canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
    })

    // Remove the clone
    document.body.removeChild(clone)

    // Convert to image and download
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `${fileName}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error("Error exporting to image:", error)
    alert("导出图片失败，请稍后再试")
  }
}
