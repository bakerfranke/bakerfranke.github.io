""" Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License
"""
from tkinter import Tk
from tkinter import mainloop
from tkinter import Label
from tkinter import Frame
from tkinter import Button
#from Tkinter import PhotoImage
from tkinter import Canvas
from tkinter import Scale
from tkinter import IntVar
from tkinter import Menu

from karel.basicdefinitions import North
from karel.basicdefinitions import East
from karel.basicdefinitions import South
from karel.basicdefinitions import West
from karel.basicdefinitions import _nextDirection

#from tkFont import Font
from tkinter.font import Font

from time import sleep
import threading

#from tkconstants import *

_moveParameters = {North: (0, -1), West: (-1, 0), South: (0, 1), East:(1, 0) }

_windowBottom = 600 #800
_windowRight = 800
_inset = 30
_basicSize = 23 #pixel count of robot image bounding box

class RobotImage:
    rNumber = 0
    def __init__(self, street, avenue, direction, window, fill='blue', outline='black'):
        self._canvas = window._canvas
        self._street = street
        self._avenue = avenue
        self.scaleFactor = window._KarelWindow__scaleFactor
        self._scaler = window._scaleToPixels
        self.__scaleFactor = window._KarelWindow__scaleFactor
#        self.__configControl = window._KarelWindow__configControl
        self._place = self._scaler(street, avenue)
        self.karelPackage = {"size":23, "draw":self.showKarel, "figure":RobotImage.karelRobot}
        self.alienPackage = {"size":6, "draw":self.showAlien, "figure":RobotImage.alienRobot}
        self.crabPackage = {"size":6, "draw":self.showAlien, "figure":RobotImage.crabRobot}

        # the next statement defines which figure will be drawn
        package = self.karelPackage
        
        self._basicSize = package["size"]   # the size of the bounding box of the figure
        self.show = package["draw"]         # the drawing method
        self.__north = package["figure"]    # the list of component listss

        self.__setup()  # compute rotations
        self.__imageChooser = {North: self.__north, East: self.__east, South: self.__south, West: self.__west}
        # maps karel directions to the image maps. 
        
        self._direction = direction
        if fill == None:
            fill = "yellow"
        self._fill = fill
        self._outline = outline
        self.tag = "r"+str(RobotImage.rNumber)
        RobotImage.rNumber += 1
        self.__buildImage()
        
        
    def deleteAll(self):
        self._canvas.delete(self.tag)
        
    # A robot image is defined by a list of lists keyed to a drawing (show) method
    # The drawing method knows how to render each element of the list
    # The pixels named (in the tuples) are within a bounding box of a certain size that
    #  can vary. It is listed as part of the drawing "package" for this figure. This one is in 
    # a square 23 pixels on a side. The simpler ones are in a 6 pixel box. This is needed for scaling.     
    karelRobot = [ # use _basicSize = 23
            [   
                (-6,-10), #poly grey head
#                (0, -8),
                (6,-10),
                (6,-3),
                (-6,-3)
            ],
            [
                (-4,-3), #poly fill color body
                (4,-3),
                (4, -2),
                (6, -2),
                (6,8),
                (-6,8),
                (-6, -2),
                (-4, -2)
            ],
            [
                (-6,8), #poly red foot
                (-2,8),
                (-2,11),
                (-6,11)
            ],
            [
                (2,8), #poly red
                (6,8),
                (6,11),
                (2,11)
            ],
            [
                (-8,-1), #poly green arm
                (-6,-1),
                (-6,6),
                (-8,6)
            ],
            [
                (8,-1), #poly green
                (6,-1),
                (6,6),
                (8,6)
            ],
            [ (-3, -7), (-1, -5)], #oval eye blue
             
            [ (1, -7), (3, -5)], #oval eye blue
            [(-2, -1), (-2, 7)], # K in black
            [(-2, 3), (3, -1)],
            [(-2, 3), (3, 7)]
    ]
    
    alienRobot = [ # use _basicSize = 6
          [
              (0, -1), # pixel polsitions in a (0,0) centered square of size _basicSize
              (0, 1), # the first list here is the basic outline - polygon
              (-3, 3), 
              (0, 1),
              (3, 3),
              (0, 1),
              (0, -1),
              (2, -1),
              (2, -2),
              (0, -3),
              (-2, -2),
              (-2, -1)
            ],
            [(-1, -2), (0, -1)], #left eye - circle
            [(0, -2), (1, -1)] #right eye - circle                
    ]
    
    crabRobot = [ # use _basicSize = 6
             [
                (0,-3), #Alternate robot image
                (-3,-1),
                (-2,-1),
                (-2,0),
                (-3,0),
                (-1,3),
                (-1,0),
                (1,0),
                (1,3),
                (3,0),
                (2,0),
                (2,-1),
                (3,-1)
             ],
             [(-1, -2), (0, -1)], #left eye - circle
             [(0, -2), (1, -1)] #right eye - circle                               
    ]
                  
    def __setup(self): 
        ''' Define the robot rotations from the basic north facing version'''
        result = []
        for list in self.__north :
            item = []       
            for (x,y) in list :
                item.append((y, -x))
            result.append(item)     
        self.__west = result
        
        result = []
        for list in self.__west :
            item = []
            for (x,y) in list :
                item.append((y, -x))
            result.append(item)
        self.__south = result
        
        result = []
        for list in self.__south :
            item = []
            for (x,y) in list :
                item.append((y, -x))
            result.append(item)
        self.__east = result

        
    def greyOut(self):
        self._outline = "grey"
        self.show()
       
        
    def move(self, amount):
        ''' Moves a robot by an arbitrary amount in pixels, not streets, but in forward direction'''        
#        self.__configControl.acquire()
        (dx,dy) = _moveParameters[self._direction]
        self._street -= dy
        self._avenue += dx
        self.translate(amount*dx, amount*dy)
        if self._canvas != None :
            self._canvas.move(self.tag, amount*dx, amount*dy)
#        self.__configControl.notify()
#        self.__configControl.release()
            
    def _dumpImage(self):
        print ("[")
        for alist in self.image :
            print ('  [')
            for (x,y) in alist :
                print ('  (' + str(x) +', ' + str(y) + '),' )
            print ('  ]')
        print ("]")
        
    def rotate(self):
        ''' image turns left'''
        if self._canvas != None :
            self._canvas.delete(self.tag)
        result = []
#        print (str(self._direction))
#        print (str(self.__imageChooser[self._direction]))
        for list in self.__imageChooser[self._direction] :
            item = []
            for (x,y) in list :
                item.append((y*self.__scale, -x*self.__scale)) #rotate AND scale
            result.append(item)
        self.image = result
        
        self._direction = _nextDirection[self._direction] #(self._direction + 1) % 4

        self.__translate(self.__translate_x, self.__translate_y)
        if self._canvas != None :
            self.show()
                
    def scale(self, mult):
        ''' scale the image up from the basic 6 (or 23...) pixel version'''
        self.__scale = mult
        result = []
        for list in self.__imageChooser[self._direction] :
            item = []
            for (x,y) in list :
                item.append((x*mult, y*mult))
            result.append(item)
        self.image = result
                    
    def __translate(self, horiz, vert):
        ''' move a robot an aribitrary amount and direction'''
        result = []
        for list in self.image :
            item = []
            for (x,y) in list :
                item.append((x + horiz, y + vert))
            result.append(item)
        self.image = result        
        
    def translate(self, horiz, vert):
        ''' remember a translateion and perform it'''
        self.__translate_x += horiz
        self.__translate_y += vert
        self.__translate(horiz, vert)
        
    def showKarel(self):
        ''' create the graphic object and make it visible'''
        self._canvas.delete(self.tag)
        result = self._canvas.create_polygon( self.image[0], # head
                              outline = self._outline,
                              fill = "grey",
                              width=2,
                              smooth = True,
                              tags = self.tag
                              )
        result = self._canvas.create_polygon( self.image[1], # body
                              outline = self._outline,
                              fill = self._fill,
                              width=2,
                              smooth = False,
                              tags = self.tag
                              )
        for i in range(2, 4): # two feet
            result1 = self._canvas.create_polygon( self.image[i],
                              outline = self._outline,
                              fill = "red",
                              width=2,
                              smooth = True,
                              tags = self.tag
                              )
#        result1 = self._canvas.create_polygon( self.image[3],
#                              outline = self._outline,
#                              fill = "red",
#                              width=2,
#                              smooth = True,
#                              tags = self.tag
#                              )
        for i in range(4, 6) : # two arms
            result1 = self._canvas.create_polygon( self.image[i],
                              outline = self._outline,
                              fill = "green",
                              width=2,
                              smooth = False,
                              tags = self.tag
                             )
#        result1 = self._canvas.create_polygon( self.image[5],
#                              outline = self._outline,
#                              fill = "green",
#                              width=2,
#                              smooth = False,
#                              tags = self.tag
#                              )
        for i in range(6, 8): # two eyes
            result1 = self._canvas.create_rectangle(self.image[i], fill = "blue", width = 2, outline = self._outline, tags = self.tag) #left eye
        for i in range(8, 11) : # letter k (three lines)
            result1 = self._canvas.create_line(self.image[i], width = 2, fill = self._outline, tags = self.tag)
        return result
    
    def showAlien(self): # works for crabRobot also
        ''' create the graphic object and make it visible'''
        self._canvas.delete(self.tag)

        result = self._canvas.create_polygon( self.image[0],
                              outline = self._outline,
                              fill = self._fill,
                              smooth = 1,
#                              stipple = self._stipple,
                              splinesteps = 10,
                              width = 2, tags = self.tag)
        color = "green"
        if self._fill == "green" :
            color = "magenta"
        result1 = self._canvas.create_oval(self.image[1], fill = color, tags = self.tag) #left eye
        result1 = self._canvas.create_oval(self.image[2], fill = color, tags = self.tag) # right eye
        return result
    
    def moveScale(self, newScaleFactor): # used to move the object after the size of world is changed
        self._canvas.delete(self.tag)
        self.__scaleFactor = newScaleFactor
        self.image = self.__imageChooser[self._direction]
        self.__buildImage()

    def __buildImage(self):
        self.__translate_x = 0
        self.__translate_y = 0
        self.scale(self.__scaleFactor/(_basicSize*1.0))
        (x,y) = self._scaler(self._street, self._avenue)
        self.translate(x, y)
        self.show()
         

class KarelWindow(Frame):
    def __init__(self, streets, avenues, callback = None): # avenues is ignored in this version
        self.__root = root = Tk(className=" Karel's World 2.0") # , geometry='800x600+60+10'
        root.geometry(newGeometry='820x650+55+10') # placement of window on desktop
        #root.geometry(newGeometry='600x600+55+25')
#        print (str(root.tk_menuBar()))
        Frame.__init__(self, master=root, cnf={})
        global _windowBottom
        global _windowRight
        global _inset
        #root.minsize(_windowBottom, _windowRight)
        root.minsize(500,500)
        root.resizable(True, True)  # Allow window resizing
        #print(_windowBottom, _windowRight, "resizeable TRUE")
        self.__bottom = _windowBottom - _inset #770
        self.__left = _inset #30
        self.__top = _inset #30
        self.__right = _windowRight - _inset #770
        self.__scaleFactor = (self.__bottom - self.__top)*1.0/streets

        self.is_paused = True  # Start in the paused state
        
        bar = Menu()        
        def endProgram(menu): exit()
        
        fil = Menu()
        fil.add_command(label = 'Quit   ^Q', command=lambda x='Quit':endProgram(x))
        bar.add_cascade(label='File', menu=fil)
        root.config(menu=bar)
        self.bind_all('<Command-q>', exit) # Mac standard
        self.bind_all('<Control-q>', exit) # Windows
        self.__streets = streets
        self.__avenues = avenues
        self.__gBeepers = {} #locations of the beeper images
        self.__contents = [] # robots, walls, beepers that need to move on a rescale
        self.__beeperControl = threading.Condition() # helps multi threaded programs avoid anomalies
        self.__walls = [] # all the basic visual elements (boundary, streets, street labels, etc. 
        
#        self.nametowidget(" Karel's World ")
        self.grid()
        
        speedLabel = Label(text = "Speed")
        speedLabel.grid(row=0, column=1, sticky="es") #added params from chatgpt

        #|   0   |  1   |   2   |   3   |   4   |
        #|EMPTY  | BUT  |  LBL  | SLID  |EMPTY  |

        if callback != None : # this makes the speed slider work. 

            # Add Play/Pause button
            #self.play_pause_btn = Button(text="Play", command=self.toggle_play_pause)
            #self.play_pause_btn.grid(row=0, column=1, sticky="w")

            from tkinter import IntVar
            self.iv = IntVar()
            self.iv.trace('r', callback)
        
            self.scale = Scale(orient = "horizontal", variable = self.iv)
            self.scale.set(20)
            self.scale.grid(row=0, column=2, sticky="ew")



        #BEF TODO: make the canvas and window scaled to the actual number of streets and avenues?
        self._canvas = Canvas(root, height = _windowBottom, width = _windowRight, bg = 'white')
        self._canvas.grid(row=1, column=0, columnspan=5, sticky="news")
        self.setSize(streets, avenues)
        self.placeBeeper = self.placeBeepers

        
#        self.__streets = streets
#        self.makeStreetsAndAvenues()
#        self.makeBoundaryWalls()
#        self.labelStreetsAvenues()
        
    def toggle_play_pause(self):
        if self.is_paused:
            # Resume execution
            self.is_paused = False
            self.play_pause_btn.config(text="Pause")
        else:
            # Pause execution
            self.is_paused = True
            self.play_pause_btn.config(text="Play ")


        #BEF NOTE: fix this so that we can have different streets and avenues.
    def setSize(self, streets, avenues = 10):         
        self.__streets = streets
        self.__avenues = avenues
        streetsScale = (self.__bottom - self.__top) / streets
        avenuesScale = (self.__right - self.__left) / avenues
        # self.__scaleFactor = min((self.__bottom - self.__top),(self.__right - self.__left)) *  1.0/max(streets,avenues)
        self.__scaleFactor = min(streetsScale, avenuesScale)

        # self.__streetScaleFactor = (self.__bottom - self.__top) * 1.0 / streets
        # self.__avenueScaleFactor = (self.__right - self.__left) * 1.0 / avenues
        
        for x in self.__walls : # boundary walls and street lines
            self._canvas.delete(x)
        self.makeStreetsAndAvenues()
        self.makeBoundaryWalls()
        self.labelStreetsAvenues()
        for item in self.__contents : #rebuild the contents of the world
            item.moveScale(self.__scaleFactor)
        
        
#    def drawArea(self):
#        return self._canvas
        
#    def delta(self):
#        return self.__scaleFactor
    
    class Beeper:
        def __init__(self, street, avenue, number, window):
            self._street = street
            self._avenue = avenue
            self._number = number
            self.__scaleFactor = window._KarelWindow__scaleFactor
            self._scaler = window._scaleToPixels
            self._code = 0 #identifies the text in the beeper
            self._rcode = 0 # identifies the oval beeper figure
            self._canvas = window._canvas



            
        def place(self):
            sizeFactor = .5 #Change this to change beeper size. The others scale from it. 
            placeFactor = .5 * sizeFactor
            val = str(self._number)
            if self._number < 0 :
                val = "oo"
            (x,y) = self._scaler(self._street+placeFactor, self._avenue-placeFactor)
            self._rcode = self._canvas.create_oval(x, y, x + self.__scaleFactor*sizeFactor, y + self.__scaleFactor*sizeFactor, fill= 'black')
            self._code = self._canvas.create_text(x + self.__scaleFactor*placeFactor, y+ self.__scaleFactor*placeFactor, text=val, 
                                      font = Font(size = int(-self.__scaleFactor*placeFactor)), fill = 'white')
            
        def deleteAll(self):
            self._canvas.delete(self._code) # the numeric value
            self._canvas.delete(self._rcode) # the oval
            
        def moveScale(self, newScaleFactor):
            self.__scaleFactor = newScaleFactor
            self._canvas.delete(self._code)
            self._canvas.delete(self._rcode)
            self.place()
#            canvas.move(self._rcode, deltax, deltay)
#            canvas.move(self._code, deltax, deltay)
            
    class Wall:
        def __init__(self, street, avenue, isVertical, window):
            self._street = street
            self._avenue = avenue
            self._isVertical = isVertical
            self.__scaleFactor = window._KarelWindow__scaleFactor
            self._scaler = window._scaleToPixels
            self._canvas = window._canvas
            if self._isVertical:
                (x, y) = self._scaler(street - .5, avenue + .5)
                self._code = self._canvas.create_line(x, y, x, y - self.__scaleFactor, width = 2)
            else:
                (x, y) = self._scaler(street + .5, avenue - .5)
                self._code = self._canvas.create_line(x, y, x + self.__scaleFactor, y, width = 2)
                # _code identifies the wall segment image in the tk layer
            
        def moveScale(self, newScaleFactor):
            self._canvas.delete(self._code) #erase the current figure in prep to draw a new one
            self.__scaleFactor = newScaleFactor
            if self._isVertical:
                (x, y) = self._scaler(self._street - .5, self._avenue + .5)
                self._code = self._canvas.create_line(x, y, x, y - self.__scaleFactor, width = 2)
            else:
                (x, y) = self._scaler(self._street + .5, self._avenue - .5)
                self._code = self._canvas.create_line(x, y, x + self.__scaleFactor, y, width = 2)
                   
            
    def placeBeepers(self,street, avenue, number):
#        self.__beeperControl.acquire() # sync was moved to tkworldadapter
        beeper = self.Beeper(street, avenue, number, self)
        beeper.place()
        self.__gBeepers[(street, avenue)] = beeper
        self.__contents.append(beeper)
#        self.__beeperControl.notify()
#        self.__beeperControl.release()
#        return beeper
        
    def deleteBeeper(self, beeperlocation, silent=False):
#        self.__beeperControl.acquire()
        beeper = self.__gBeepers.get(beeperlocation, None)
        if beeper != None :
            beeper.deleteAll()
            self.__gBeepers.pop(beeperlocation)
            i = 0
            for b in self.__contents :
                if b == beeper :
                    break
                i+=1
            self.__contents.pop(i)
        else:
            if not silent: print ("no beeper here: " + str(beeperlocation))
#        self.__beeperControl.notify()
#        self.__beeperControl.release()
    
    def placeWallNorthOf(self, street, avenue):
        self.__contents.append(self.Wall(street, avenue, False, self))
        
    def placeWallEastOf(self, street, avenue):
        self.__contents.append(self.Wall(street, avenue, True, self))
    


    def makeBoundaryWalls(self):
        (x, y) = self._scaleToPixels(.5, .5) # hardcode ok. Half way between streets
        #print (x,y)
        # vertical wall
        self.__walls.append(self._canvas.create_line(x, 0, x, y, width = 2)) # should width depend on number of streets?
        global _inset
        self.__walls.append(self._canvas.create_line(x, y, self.__right + _inset, y, width = 2))
        
    def makeStreetsAndAvenues(self):
        for i in range(0, self.__streets) :
            (x, y) = self._scaleToPixels(i+1, .5)
            (tx, ty) = self._scaleToPixels(i+1, self.__avenues + 0.5)
            self.__walls.append(self._canvas.create_line(x, y, tx, ty, fill="red"))

        for i in range(0, self.__avenues) :
            (x,y) = self._scaleToPixels(.5, i + 1)
            (tx, ty) = self._scaleToPixels(self.__streets + 0.5, i + 1)
            self.__walls.append(self._canvas.create_line(x, y, tx, ty, fill= "red"))


    def labelStreetsAvenues(self):
        for i in range(self.__streets):
            (x, y) = self._scaleToPixels(i + 1, .25)
            self.__walls.append(self._canvas.create_text(x,y, fill = 'black', text = str(i+1)))
        
        for i in range(self.__avenues):
            (x,y) = self._scaleToPixels(.25, i + 1)
            self.__walls.append(self._canvas.create_text(x,y, fill = 'black', text = str(i+1)))
    
    def addRobot(self, street, avenue, direction, fill, outline):
        #        fill and outline are colors, default to blue, black
        robot = RobotImage(street, avenue, direction, self, fill, outline)
        self.__contents.append(robot)
        return robot # the world matches these with the actual robot objects in the model. 
    
    def moveRobot(self, robot, amount = -1):
        #If no amount is specified then it moves one block, Otherwise amount pixels, not blocks
        if amount < 0 :
            amount = self.__scaleFactor
        robot.move(amount)
    
    # return the pixel coordinate of st, ave
    def _scaleToPixels(self, street, avenue): # origin is at corner (0,0) outside the world
        return (self.__left + avenue*self.__scaleFactor, self.__bottom - street*self.__scaleFactor)
        # x = self.__left + (avenue - 1) * self.__avenueScaleFactor
        # y = self.__bottom - (street - 1) * self.__streetScaleFactor
        # return x, y
    
    def run(self, task, *pargs): # this is the actual graphic main. 
        # Render the initial state of the robot/world before starting the loop
        # def wait_while_paused():
        #     while self.is_paused:
        #         self.update_idletasks()
        #         self.update()  # Keep the GUI responsive while paused

        # def wrapped_task(*pargs):
        #     # Call the task once to render the initial state


        #     # Control execution with play/pause
        #     while True:
        #         wait_while_paused()  # Wait if paused
        #         try:
        #             task(*pargs)  # Execute the task
        #         except StopIteration:
        #             break
        #         self.update_idletasks()
        #         self.update()

        # def wrapped_task(*pargs):
        #     initialize_task()  # Render the initial state
        #     try:
        #         while True:
        #             if wait_while_paused:  # Wait while paused
        #                 wait_while_paused()
        #             task(*pargs)  # Execute the task
        #     except StopIteration:
        #         pass

        # mainThread = threading.Thread(target = wrapped_task, args=pargs)
        mainThread = threading.Thread(target = task, args=pargs)
        mainThread.start()
        self.mainloop()
        
    def _test(self):
        pass
#        self.karel = RobotImage(North, "red", "black")
##        beep = self.Beeper(4, 4, 5, self.scaleToPixels, self.__scaleFactor)
##        code = beep.place(self._canvas)
#        beep = self._placeBeeper(4, 4, 5)
#        self.karel.scale(self.__scaleFactor/6.0)
#        (x,y) = self.scaleToPixels(3, 5)
#        self.karel.translate(x, y)
#        image = self.karel.show(self._canvas)
#        from Canvas import Polygon
#        
#        poly = Polygon(self._canvas, (0, 100, 120, 22), width = 4, fill = "blue")
#        
#        self._canvas.create_polygon([(0, 100), (120, 22), (300, 40)], width = 4, fill = "blue")
#        
#        print (poly.__repr__())
#        print
#        print (poly.keys())
#        print (poly['fill'].__class__ )

#        from Tkinter import IntVar
#        iv = Intvar()
#        
        
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
#        self.karel.rotate(self._canvas)
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        self.sue = RobotImage(North, "blue", "green")
#        self.sue.scale(self.__scaleFactor/6.0)
#        (x,y) = self.scaleToPixels(3, 2)
#        self.sue.translate(x, y)
#        self.sue.show(self._canvas)
#        sleep(.5)
#        self.sue.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
##        self.sue.rotate(self._canvas)
##        sleep(.5)
#        self.sue.move(self._canvas, self.__scaleFactor)
#        
##        beep.deleteAll(self._canvas,code)
#        self.deleteBeeper(beep)
#        self._placeWallNorthOf(4, 4)
#        self._placeWallNorthOf(4, 3)
#        self._placeWallNorthOf(4, 5)
#        self._placeWallEastOf(4, 5)
#        
#        beep = self._placeBeeper(3, 4, -1)
#        
#        self.karel.rotate(self._canvas)
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
#        self.karel.rotate(self._canvas)
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
#        self.karel.rotate(self._canvas)
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
#        self.karel.rotate(self._canvas)
#        sleep(.5)
#        self.karel.move(self._canvas, self.__scaleFactor)
#        sleep(.5)
#        beep = self.Beeper(3, 4, -1, self.scaleToPixels, self.__scaleFactor)
#        beep.place(self._canvas)
#        for i in range(10):
#            sleep(1.0)
#            self.robby.rotate(self._canvas)
#            sleep(1.0)
##            self.robby.translate(10, 10)
#            self.robby.move(self._canvas)
#            self.robby.scale(0.9)
            
#            self._canvas.move(4, 10, 10)
      
#        tester = RobotImage(North, "black", "black")
#        print ("North")
#        tester._dumpImage()  
#        print ("West")
#        tester.rotate(self._canvas)
#        tester._dumpImage() 
#        print ("South")
#        tester.rotate(self._canvas)
#        tester._dumpImage()     
#        print ("East")
#        tester.rotate(self._canvas)
#        tester._dumpImage()     
    
#        button = Button(frame,text="Exit",command=root.destroy)
#        button.pack(side=BOTTOM) 
               

       
if __name__ == '__main__': # this is to run test code only. Not normally used
    window = KarelWindow(12, 12)
    
    mainThread = threading.Thread(target = window._test)
    mainThread.start()
    
    window.mainloop()
#    for i in range(10):
#        sleep(1.0)
#        window.canvas.move("foo", 10, 10)

