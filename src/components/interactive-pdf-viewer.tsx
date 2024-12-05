import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SunMedium, ChevronRight, ChevronLeft, Maximize2, Minimize2, Search, Moon, Sun } from 'lucide-react'
import { Camera, Zap, Eye, Sliders, Image, Filter, Activity, Target } from 'lucide-react'; // Import icons from lucide-react
import "../../src/style/global.css"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Slider } from "./ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from "./ui/separator"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import type { IHighlight } from "../types"
import { Sidebar } from "../../example/src/Sidebar"
import { Edit } from "./Edit"
import { FloatingBarComponent } from "./floating-bar"
import { usePages } from "../../example/src/PageContext"
import type { Content } from "../types"

import PDFViewer from "./PDFSidebar"
interface Props {
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  toggleDocument: () => void;
  children?: React.ReactNode;
  note: Content | null;
}

type FilterKey = keyof typeof filters;

const filters = {
  classicBlackAndWhite: "grayscale(100%)",
  nightMode: "invert(1)",
  sepiaTone: "sepia(100%)",
  coolTone: "hue-rotate(200deg)",
  warmGlow: "hue-rotate(-30deg)",
  highSaturation: "saturate(200%)",
  softGlow: "blur(4px)",
  oldFilmLook: "sepia(60%) blur(1px)",
  nightVision: "hue-rotate(120deg) grayscale(50%)",
  retroNeon: "hue-rotate(280deg) saturate(250%)"
} as const;

// type FilterButton = typeof filterButtons[number];

// Map each filter to an icon and label for the buttons
const filterButtons = [
  { name: "classicBlackAndWhite", label: "Black & White", icon: Camera },
  { name: "nightMode", label: "Night Mode", icon: Moon },
  { name: "sepiaTone", label: "Sepia", icon: Image },
  { name: "coolTone", label: "Cool Tone", icon: Sliders },
  { name: "warmGlow", label: "Warm Glow", icon: Sun },
  { name: "highSaturation", label: "Saturation", icon: Zap },
  { name: "softGlow", label: "Soft Glow", icon: Eye },
  { name: "oldFilmLook", label: "Old Film", icon: Filter },
  { name: "nightVision", label: "Night Vision", icon: Activity },
  { name: "retroNeon", label: "Retro Neon", icon: Target }
] as const;




export function InteractivePdfViewer(props: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(50)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [color, setColor] = useState('#000000')
  const [fontStyle, setFontStyle] = useState('normal')
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif')
  const [fontSize, setFontSize] = useState('16')
  const [fontWeight, setFontWeight] = useState('normal')


  const { pages, setPages, zoomLevel, isPanning, isSearchOpen } = usePages();
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Pan offset values
  const startPan = useRef({ x: 0, y: 0 }); // Mouse starting position for panning
  const panContainerRef = useRef<HTMLDivElement | null>(null); // Reference to the zoomable div

  const isDragging = useRef(false);



  const [isPDFFullScreen, setIsPDFFullScreen] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const pdfViewerRef = useRef<HTMLDivElement>(null)
  const [ele, setele] = useState<any>("")

  // To store the active filter
  const [activeFilters, setActiveFilters] = useState<string[]>([]);;

  // Function to toggle filters on button click
  // Function to toggle filters on button click
  const handleFilterClick = (filterName: FilterKey) => {
    setActiveFilters(prevFilters => {
      const filterValue = filters[filterName];
      if (prevFilters.includes(filterValue)) {
        // Remove filter if it's already active
        return prevFilters.filter(filter => filter !== filterValue);
      } else {
        // Add filter if it's not active
        return [...prevFilters, filterValue];
      }
    });
  };



  function applyDynamicStyles(
    removeBlendMode: boolean, // Determines if mix-blend-mode should be removed
    color: string, // Color for span and br elements
    backgroundColor: string, // Background color for span and br elements
    fontFamily: string = 'Arial, sans-serif', // Default font family
    fontSize: string = '16px', // Default font size
    fontWeight: string = 'normal', // Default font weight
    fontStyle: string = 'normal' // Default font style
  ): void {
    // Remove any previously injected style block
    const existingStyle = document.getElementById('dynamic-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create a new style block
    const style = document.createElement('style');
    style.id = 'dynamic-style';

    // Apply the mix-blend-mode if it's not to be removed
    const blendModeStyle = removeBlendMode ? '' : 'mix-blend-mode: multiply;';

    style.textContent = `
      .textLayer {
        z-index: 2;
        opacity: 1;
        display: flex;
        ${blendModeStyle}
      }
      .textLayer :is(span, br) {
        color: ${color};
        background-color: ${backgroundColor};
        position: absolute;
        white-space: pre;
      
        transform-origin: 0% 0%;
        font-family: ${fontFamily};
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
      }
    `;

    document.head.appendChild(style);
  }

  useEffect(() => {
    if (!showMoreOptions) {
      applyDynamicStyles(false, 'transparent', 'transparent');
      return;
    }

    console.log(`${fontFamily}, ${fontSize}, ${fontWeight}, ${fontStyle}`);

    applyDynamicStyles(true, color, 'rgb(255, 255, 255)', fontFamily, `${fontSize}px`, fontWeight, fontStyle);
  }, [color, fontSize, fontWeight, fontStyle, showMoreOptions]);

  // Combine active filters into a single string
  const combinedFilters = activeFilters.join(' ');



  const handlePageClick = (event: MouseEvent) => {
    // Check if the clicked element is within the pdfViewer container and has the data-page-number attribute
    const pageContainer = (event.target as HTMLElement).closest("div[data-page-number]");

    if (pageContainer) {
      const pageNum = pageContainer.getAttribute("data-page-number");
      if (pageNum) {
        console.log("Page number clicked:", pageNum);
        setPages(parseInt(pageNum));
      }
    }
  };


  const highlightPage = (pageNum: number) => { // Add a blue border to the clicked page
    const pageContainer:any = document.querySelector(`div[data-page-number="${pageNum}"]`);
    if(pageContainer){
      pageContainer.style.border = "1px solid blue";

    // Optionally, remove the border from previously clicked pages
    // Remove border from all page containers before adding to the clicked one
    const allPages = document.querySelectorAll("div[data-page-number]");
    allPages.forEach((page: Element) => {
      if (page !== pageContainer) {
        (page as HTMLElement).style.border = "";
      }
    });
    }
  }

  useEffect(() => {
    // Get the pdfViewer container
    const pdfViewerElement = document.querySelector(".pdfViewer");
    console.log(pdfViewerElement)
    setele(pdfViewerElement)
    highlightPage(pages)

    if (pdfViewerElement) {
      // Attach the event listener to the pdfViewer element
      pdfViewerElement.addEventListener("click", handlePageClick);

      // Cleanup the event listener when the component unmounts
      return () => {
        pdfViewerElement.removeEventListener("click", handlePageClick);
      };
    }
  }, [pages, ele]); // Empty dependency array ensures this runs only on mount/unmount





  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanning) return; // Only allow panning if isPanning is true
    isDragging.current = true; // Mark as dragging
    startPan.current = { x: e.clientX, y: e.clientY };
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !isDragging.current) return; // Only pan if panning is enabled and dragging is active

    const deltaX = e.clientX - startPan.current.x;
    const deltaY = e.clientY - startPan.current.y;

    setPanOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    startPan.current = { x: e.clientX, y: e.clientY }; // Update the starting position for next move
  };

  const handleMouseUp = () => {
    if (isPanning && isDragging.current) {
      isDragging.current = false; // End panning when the mouse is released
    }
  };
  // Prevent default dragging behavior
  const preventDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const togglePDFFullScreen = () => {
    setIsPDFFullScreen(!isPDFFullScreen)
  }
  useEffect(() => { console.log(zoomLevel) }, [zoomLevel])

  return (
    <div className="h-full flex flex-col bg-gray-200 ">
      {/* Top Toolbar */}
      <motion.div
        className="bg-white shadow-md p-4 flex justify-between items-center"
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Input placeholder="Search in document..." className="w-64" />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center bg-blue-300 rounded-full">
            <Button variant="ghost" size="icon" className="rounded-l-full" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages))}
              className="w-16 text-center border-none bg-transparent"
            />
            <Button variant="ghost" size="icon" className="rounded-r-full" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 ">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className='hover:bg-gray-200 rounded-full'>
                <SunMedium className="h-5 w-5 " />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white absolute right-1 z-20">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="brightness" className="text-sm font-medium">Brightness</label>
                  <Slider
                    id="brightness"
                    min={50}
                    max={100}
                    step={1}
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}

                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contrast" className="text-sm font-medium">Contrast</label>
                  <Slider
                    id="contrast"
                    min={50}
                    max={100}
                    step={1}
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                  />


                </div>
                <div className="space-y-2">
                  {/* <div className="flex justify-between gap-2">
                    <button
                      onClick={() => setIsNightShift(!isNightShift)}
                      className="flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <div className="rounded-full p-2 group">
                        <Sun className={`h-5 w-5 transition-colors ${isNightShift ? 'fill-orange-300 text-orange-300' : 'text-gray-600 group-hover:text-orange-300'}`} />
                      </div>
                      <span className="text-xs font-medium">Night Shift</span>
                      <span className="text-[10px] text-gray-500">{isNightShift ? 'On' : 'Off'}</span>
                    </button>

                    <button
                      onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
                      className="flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <div className="rounded-full p-2 group">
                        <Sparkles className={`h-5 w-5 transition-colors ${isBlackAndWhite ? 'fill-blue-500 text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
                      </div>
                      <span className="text-xs font-medium">True Tone</span>
                      <span className="text-[10px] text-gray-500">{isBlackAndWhite ? 'On' : 'Off'}</span>
                    </button>

                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <div className="rounded-full p-2 group">
                        <Moon className={`h-5 w-5 transition-colors ${isDarkMode ? 'fill-blue-500 text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
                      </div>
                      <span className="text-xs font-medium">Dark Mode</span>
                      <span className="text-[10px] text-gray-500">{isDarkMode ? 'On' : 'Off'}</span>
                    </button>


                  </div> */}

                  <div className="gap-2 grid grid-cols-3">
                    {filterButtons.map(({ name, label, icon: Icon }) => (
                      <button
                        key={name}
                        onClick={() => handleFilterClick(name)}
                        className="flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100"
                      >
                        <div className="rounded-full p-2 group">
                          <Icon
                            className={`h-5 w-5 transition-colors ${activeFilters.includes(filters[name])
                              ? 'fill-orange-300 text-orange-300'
                              : 'text-gray-600 group-hover:text-orange-300'
                              }`}
                          />
                        </div>
                        <span className="text-xs font-medium">{label}</span>
                        <span className="text-[10px] text-gray-500">
                          {activeFilters.includes(filters[name]) ? 'On' : 'Off'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Separator className='bg-gray-200' />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="more-options" className="text-sm font-medium">More Options</Label>
                    <Switch
                      id="more-options"
                      checked={showMoreOptions}
                      onCheckedChange={setShowMoreOptions}
                    />
                  </div>

                  {showMoreOptions && (
                    <div className="space-y-4 pt-4">
                      {/* Color Section */}
                      <div className="space-y-2">
                        <Label htmlFor="color-input" className="text-sm font-medium">Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            id="color-input"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-10 p-0 border-none"
                          />
                          <Input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="flex-grow"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Font Family Section */}
                      <div className="space-y-2">
                        <Label htmlFor="font-family-select" className="text-sm font-medium">Font Family</Label>
                        <Select value={fontFamily} onValueChange={(e: string) => { setFontFamily(e) }}>
                          <SelectTrigger id="font-family-select">
                            <SelectValue placeholder="Select font family" />
                          </SelectTrigger>
                          <SelectContent className='bg-white'>
                            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                            <SelectItem value="Courier New, Courier, monospace">Courier New</SelectItem>
                            <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Font Size Section */}
                      <div className="space-y-2">
                        <Label htmlFor="font-size-input" className="text-sm font-medium">Font Size</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            id="font-size-input"
                            value={fontSize}
                            onChange={(e) => {
                              setFontSize(e.target.value);
                              console.log(e.target.value);
                            }}
                            min="8"
                            max="72"
                            className="flex-grow"
                          />
                          <span className="text-sm text-gray-500">px</span>
                        </div>
                      </div>

                      {/* Font Weight Section */}
                      <div className="space-y-2">
                        <Label htmlFor="font-weight-select" className="text-sm font-medium">Font Weight</Label>
                        <Select value={fontWeight} onValueChange={(e: string) => setFontWeight(e)}>
                          <SelectTrigger id="font-weight-select">
                            <SelectValue placeholder="Select font weight" />
                          </SelectTrigger>
                          <SelectContent className='bg-white'>
                            <SelectItem value="normal">Normal</SelectItem>
                            {/* <SelectItem value="medium">Medium</SelectItem> */}
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}


                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={togglePDFFullScreen} className='hover:bg-gray-200 rounded-full'>
            {isPDFFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </motion.div>



  {/* <div className='pdf-sidebar'></div> */}
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden  ">
        {/* PDF Viewer */}

        <motion.div
          ref={pdfViewerRef}
          className={`${isPDFFullScreen ? 'fixed inset-0 ' : 'w-full'} p-8 overflow-auto flex items-center justify-center bg-gray-200`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gray-200 rounded-lg shadow-xl w-full h-full flex overflow-hidden"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%)  ${combinedFilters}  `,
                transition: 'filter 0.3s ease',  // Smooth transition
              }}
            >
              {/* <BookOpen className="h-32 w-32 text-gray-300" /> */}
              <div className="h-full w-full bg-gray-200"
                ref={panContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Stop panning if mouse leaves the container
                onDragStart={preventDrag} // Prevent default dragging behavior
                style={{
                  // overflow: isPanning ? 'hidden' : 'auto',
                  cursor: isPanning ? 'grabbing' : '',
                  position: 'relative',
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease', // Smooth transition for zooming and panning
                  userSelect: isPanning ? 'none' : 'auto',
                }}
              > {props.children} </div>

            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        {/* {!isPDFFullScreen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-2/5  bg-white border-l border-gray-200 flex flex-col"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col ">
              <TabsList className="w-full justify-start border-b border-gray-200 px-2 h-12">
                <TabsTrigger value="notes" className="data-[state=active]:bg-gray-100">Notes</TabsTrigger>
                <TabsTrigger value="highlights" className="data-[state=active]:bg-gray-100">Highlights</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="flex-1 p-4 overflow-auto">
                <div className="border-2 rounded-xl border-gray-100 shadow-lg">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <motion.div
                      initial={{ x: 300 }}
                      animate={{ x: 0 }}
                    >

                      <Edit note={props.note} />//

                    </motion.div>

                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent value="highlights" className="flex-1 p-4 overflow-auto">

                <Sidebar
                  highlights={props.highlights}
                  resetHighlights={props.resetHighlights}
                  toggleDocument={props.toggleDocument} />

               
              </TabsContent>
            </Tabs>
          </motion.div>
        )} */}

{/* <PDFViewer /> */}
      </div>

      <FloatingBarComponent />

    </div>
  )
}