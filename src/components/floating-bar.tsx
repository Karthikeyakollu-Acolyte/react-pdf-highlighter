import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { usePages } from "../../example/src/PageContext"
import { ZoomIn, ZoomOut, Hand, RotateCcw, FileOutput, Merge, Save, Share2, ChevronLeft, ChevronRight, Search, Mail, Link } from 'lucide-react'


export function FloatingBarComponent() {



  const { pages, setPages, zoomLevel, setZoomLevel, isPanning, setIsPanning, isSearchOpen, setIsSearchOpen } = usePages();

  const totalPages = 50
  function rotateSinglePage(pageNum: number) {
    var viewerMain = document.getElementsByClassName("pdfViewer")[0];
    if (!viewerMain) {
      console.error("pdfViewer element not found");
      return; // Exit if the viewer main element is not found
    }

    var pageContainer = viewerMain.querySelector(`div[data-page-number='${pageNum}']`);
    if (!pageContainer) {
      console.error(`Page number ${pageNum} not found`);
      return; // Exit if the specific page container is not found
    }

    // Get the current rotation degree of the page
    const currentRotation = pageContainer.style.transform.match(/rotate\((\d+)deg\)/);
    let newRotation = 90; // Default to 90 degrees if no previous rotation

    if (currentRotation) {
      // Extract the current rotation value
      let currentDegree = parseInt(currentRotation[1]);
      newRotation = (currentDegree + 90) % 360; // Increment by 90 and keep it within 0-359 degrees
    }

    // Apply the new rotation
    pageContainer.style.transform = `rotate(${newRotation}deg)`;
    pageContainer.style.transformOrigin = "center center"; // Ensure rotation is centered
  }



  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border rounded-full shadow-lg p-2 flex items-center space-x-4 transition-all duration-300 ease-in-out">
      {/* Pagination Tools */}
      <div className="flex items-center space-x-1 px-2">
        <Button variant="ghost" size="icon" onClick={() => setPages(Math.max(1, pages - 1))} className="transition-colors duration-200">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-2">Page {pages} of {totalPages}</span>
        <Button variant="ghost" size="icon" onClick={() => setPages(Math.min(totalPages, pages + 1))} className="transition-colors duration-200">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />
      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        {/* Zoom Out Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.1))}
          className="transition-colors duration-200"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        {/* Slider for Zoom */}
        <Slider
          value={[zoomLevel]}
          onValueChange={(value) => setZoomLevel(value[0])}
          min={1}
          max={2}
          step={0.1}
          className="w-24"
        />

        {/* Zoom In Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          className="transition-colors duration-200"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>



      <Separator orientation="vertical" className="h-6" />

      {/* Panning Toggle */}
      <Button
        variant={isPanning ? "secondary" : "ghost"}
        size="icon"
        onClick={() => setIsPanning(!isPanning)}
        className={`transition-colors duration-200 ${isPanning ? "fill-blue-500  text-blue-500" : ""}`}
      >
        <Hand className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Search Bar */}
      <div className="flex items-center">
        {isSearchOpen ? (
          <Input
            type="text"
            placeholder="Search..."
            className="w-40 h-8 transition-all duration-300 ease-in-out"
            onBlur={() => setIsSearchOpen(false)}
          />
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="transition-colors duration-200">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* PDF Task Options */}
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="transition-colors duration-200 ">PDF Tasks</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => rotateSinglePage(pages)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Rotate</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileOutput className="mr-2 h-4 w-4" />
            <span>Extract Pages</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Merge className="mr-2 h-4 w-4" />
            <span>Merge Documents</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Save className="mr-2 h-4 w-4" />
            <span>Save Annotations</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* Share Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="transition-colors duration-200">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            <span>Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="mr-2 h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}