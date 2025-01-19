""" Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

Represents the robot world. It maintains knowledge about walls and beepers in the world. It also knows 
about the robots that have been created. 

It has API to place beepers and walls.

It can read and write world files
"""

#import sys
#import thread
import threading
import karel.robota
import time
from karel.observable import Observer
#from exceptions import NotImplementedError

from karel.basicdefinitions import legalCorner
from karel.basicdefinitions import infinity
from karel.basicdefinitions import NoBeepers
from karel.basicdefinitions import NoRobots
from karel.basicdefinitions import IllegalCorner


from karel.tkwindow import RobotImage
from karel.tkwindow import KarelWindow

_window = None #KarelWindow(12, 12)



from karel.robotworldbase import RobotWorldBase

class RobotWorld(RobotWorldBase, Observer) :
    """
    The robot world consisting of horizontal streets, vertical avenues, walls, and beepers. 
    The bottom left corner of the world is (1, 1), First street and first avenue. 
    While it is technically possible to create many objects of type RobotWorld, note that they won't be
    useful, as the robots themselves have defined their own world and "live" there. robota.world is the
    world known to the robots. It can, however, be replaced with a simple assignment.
    
    The world observes all robots. 
    """
    
    def __init__(self, name, streets = 10, avenues = 10):
        "Create an empty world."
        self._name = name
        self._beepers = {}
#        self.__gBeepers = {}
        self._eastWestWalls = {}
        self._northSouthWalls = {}
        self._robots = {}
        self.__gRobots = {}
        self.__delay = 80 # slow
        self._isVisible = False
        self.__beeperControl = threading.Condition()
        self._streets = streets
        self._avenues = avenues
#        print("creating tk world", name)
        self.trace_enabled = False

    # ADDED BY BAKER 1.8.24
    def setTrace(self, enabled: bool):
        """Enable or disable global trace output for all robots."""
        self.trace_enabled = enabled

    def update(self, robot, robotState = None):
        "This is called whenever any robot changes state since the world observes all robots"

        action = robotState.action()
        if action == karel.robota.UrRobot.moveAction  :
            self._registerRobot(robot)
#            self.__gRobots[robot].move(_window.drawArea(), _window.delta())
            if _window != None:
                _window.moveRobot(self.__gRobots[robot])
            
        elif action == karel.robota.UrRobot.createAction :
            self._registerRobot(robot)
            if _window != None:
                (street, avenue) = (robot._UrRobot__street, robot._UrRobot__avenue)
                self.__gRobots[robot] = _window.addRobot(street, avenue, robot._UrRobot__direction,
                                                     robot._UrRobot__fill, robot._UrRobot__outline)
            
        elif action == karel.robota.UrRobot.turnLeftAction :
            if _window != None:
                self.__gRobots[robot].rotate()
        
        elif action == karel.robota.UrRobot.pickBeeperAction :
            pass # moved to removeBeeper
#            time.sleep(.2) # try to avoid beepere anomalies between threads 9a bit)
#            place = (street, avenue) = (robot._UrRobot__street, robot._UrRobot__avenue)
#            inWorld = self._beepers.get(place, 0)
#            beeper = self.__gBeepers.get(place, None)
#            if beeper != None :
#                _window.deleteBeeper(beeper)
#            if inWorld != 0 :
#                beeper = _window.placeBeeper(street, avenue, inWorld)
#                self.__gBeepers[place] = beeper
        
        elif action == karel.robota.UrRobot.putBeeperAction :
            pass
        
        elif action == karel.robota.UrRobot.turnOffAction :
            self.__gRobots[robot].greyOut();
        
        else :
            pass
        
        #if hasattr(self, "trace_enabled") and self.trace_enabled:
        if self.trace_enabled:

            from karel.robota import UrRobot #defer this import to here to prevent circular import, we need the actions dictionary
            print(
                f"TRACE: Robot {robot.ID()} at ({robotState.street()}, {robotState.avenue()}) facing {robotState.direction().__name__} "
                f"with {robotState.beepers()} beeper(s), action: {UrRobot.actions[robotState.action()]}, {robotState.isRunning()}"
            )
            
    def name(self):
        "Return the name of this world"
        return self._name
    
    def setDelay(self, amount): # MANUALTEST: Must be tested manually
        """Set the amount by which primitive instructions should be delayed
        0 (default) means not at all
        100 (the maximum) means a lot (currently about 1 second)
        """
        if amount < 0 : amount = 0
        if amount > 100 : amount = 100
        self.__delay = amount 
        if _window != None :
            _window.iv.set(100 - amount)
        
    def speedCallback(self,*args):
        global _window
        if _window != None :
            self.setDelay(100 - _window.iv.get())
        
    def speedCheck(self):
        pass
    
    def delay(self):
        return self.__delay

    
#    _runnables = []
    
# 
        
    def placeBeepers(self, street, avenue, howMany=1, byUser = True):
        """
        Place any number of beepers at a corner. Use RobotWorld.infinity to place an infinite number.
        The number will be added to the number currently there. Don't try to reduce the number
        by giving a negative value. Strange behavior can result since negative values are treated as infinite. 
        """
        self.__beeperControl.acquire()
        if howMany == 0 :
            return
        legalCorner(street, avenue)
        place = (street, avenue)
        
        if howMany < 0 :
            self._beepers[place] = infinity
            if _window != None:
                _window.deleteBeeper(place, True)               
                _window.placeBeepers(street, avenue, infinity)
                self.__beeperControl.notify()
                self.__beeperControl.release()
            return
        inWorld = self._beepers.get(place, 0)
        toPut = howMany + inWorld
        if inWorld != infinity :
            self._beepers[place] = toPut
            if _window != None:
                if inWorld > 0 :
                    _window.deleteBeeper(place)
                _window.placeBeepers(street, avenue, toPut)
        self.__beeperControl.notify()
        self.__beeperControl.release()
            
        
    def placeWallNorthOf(self, street, avenue):
        "Place an east-west wall segment north of this corner"
        legalCorner(street, avenue)
        self._eastWestWalls[(street, avenue)] = 1;
        if _window != None:
            _window.placeWallNorthOf(street, avenue)
        
#        
    def placeWallEastOf(self, street, avenue) :
        "Place a north-south wall segment east of this corner"
        legalCorner(street, avenue)
        self._northSouthWalls[(street, avenue)] = 1;
        if _window != None:
            _window.placeWallEastOf(street, avenue)
        

    def removeBeeper(self, street, avenue, byUser = True) :
        """Remove a single beeper from this corner. An exception will be raised if there are none"""
#        time.sleep(.2)
        self.__beeperControl.acquire()
        place = (street, avenue)
        howMany = self._beepers.get(place, 0)
        if howMany > 0 :
            howMany -= 1
            if howMany == 0 :
                self._beepers.pop(place)
                if _window != None :
                    _window.deleteBeeper(place)
            else:
                self._beepers[place] = howMany
                if _window != None:
                    _window.deleteBeeper(place)
                    _window.placeBeepers(street, avenue, howMany)
        elif howMany == infinity :
            return
        else :
            self.__beeperControl.notify()
            self.__beeperControl.release()
            raise NoBeepers("(" + str(street) + ", " + str(avenue) + ")")
        self.__beeperControl.notify()
        self.__beeperControl.release()
        
        
#    def _visible(self, x, y, xBound, yBound):
#        return x >= 0 and y >= 0 and x < xBound and y < yBound
#        

    def setSize(self, numberOfStreets=10, numberOfAvenues=10):
        global _window  
        if _window == None :
            _window = KarelWindow(numberOfStreets, numberOfAvenues, world.speedCallback)       
        _window.setSize(numberOfStreets, numberOfAvenues)
#        _window = KarelWindow(numberOfStreets, numberOfAvenues, self.speedCallback)
#        _windwo.setCallback(self.speedCheck)
#        raise NotImplementedError("Set size needs to be implemented") # default 10 by 10
    
#     def setVisible(self, visible = True):
#         self._isVisible = visible
# #        raise NotImplementedError("SetVisible needs to be implemented") # true to show, false to hide
    def setVisible(self, visible=True):
        self._isVisible = visible
        if _window:
            if visible:
                _window._KarelWindow__root.deiconify()  # Show the window
            else:
                _window._KarelWindow__root.withdraw()  # Hide the window

    
    def isVisible(self):
        return self._isVisible
    
    def showBuilder(self):
        pass #TODO: add this
        
    def showSpeedControl(self, visible = True):
        pass #TODO: add this

    def initialize_graphics(self):
        """Shared method to initialize the graphics window."""
        from karel.tkworldadapter import _window, window, world

        global _window
        if _window is None:
            _window = window()  # Initialize the graphics window
            world.setSize(10, 10)  # Default world size
            world.setDelay(20)  # Default animation delay
            _window.update()  # Refresh the graphics window

    def readWorld(self, filename):
        """Read the world configuration from a file and initialize graphics if needed."""
        #from karel.tkworldadapter import initialize_graphics
        self.initialize_graphics()  # Ensure graphics are initialized
        super().readWorld(filename)  # Call the base class implementation
        global _window
        if _window:
            _window.update()  # Trigger a refresh of the graphical window
            #_window.run(lambda: None)  # Keep the window open

world = RobotWorld("Karel's Graphical World")


def window(streets=12, avenues=12):
    global _window
    if _window == None :
        _window = KarelWindow(streets, avenues, world.speedCallback)       
    return _window

#window = createWindow()
