""" Copyright 2008 Joseph Bergin -- Update 2025 Baker Franke
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

from karel.basicdefinitions import legalCorner
from karel.basicdefinitions import infinity
from karel.basicdefinitions import NoBeepers
from karel.basicdefinitions import NoRobots
from karel.basicdefinitions import IllegalCorner

from karel.observable import Observer
#from exceptions import NotImplementedError

infinity = -1
_window = None

def window(streets = 10, avenues = 10):
    global _window
    if _window == None:
        _window = world
    return _window

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
    
    def __init__(self, name):
        "Create an empty world."
        self._name = name
        self._beepers = {}
        self._eastWestWalls = {}
        self._northSouthWalls = {}
        self._robots = {}
        self.__delay = 0
        self._isVisible = False
        print("Creating ", name)
    
    def run(self, task, *pargs):
       mainThread = threading.Thread(target = task, args=pargs)
       mainThread.start()

    def update(self, robot, robotState = None):
        "This is called whenever any robot changes state since the world observes all robots"
        if robotState == None :
            return
        action = robotState.action()
        if action == karel.robota.UrRobot.moveAction or action == karel.robota.UrRobot.createAction :
            self._registerRobot(robot)

        from karel.robota import UrRobot #defer this import to here to prevent circular import, we need the actions dictionary
        print(
            f"UPDATE: Robot {robot.ID()} at ({robotState.street()}, {robotState.avenue()}) facing {robotState.direction().__name__} "
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
        
    def speedCheck(self):
        pass
    
    def delay(self):
        return self.__delay

    
#    _runnables = []
    
    def placeBeepers(self, street, avenue, howMany=1, byUser=True):
        """
        Place any number of beepers at a corner. Use RobotWorld.infinity to place an infinite number.
        The number will be added to the number currently there. Don't try to reduce the number
        by giving a negative value. Strange behavior can result since negative values are treated as infinite.
        """
        if howMany == 0:
            return
        legalCorner(street, avenue)
        place = (street, avenue)
        if howMany < 0:
            self._beepers[place] = infinity
            return
        inWorld = self._beepers.get(place, 0)
        if inWorld != infinity:
            self._beepers[place] = howMany + inWorld
       
    def placeWallNorthOf(self, street, avenue):
        "Place an east-west wall segment north of this corner"
        legalCorner(street, avenue)
        self._eastWestWalls[(street, avenue)] = 1;
        
        
    def placeWallEastOf(self, street, avenue) :
        "Place a north-south wall segment east of this corner"
        legalCorner(street, avenue)
        self._northSouthWalls[(street, avenue)] = 1;
        

    def removeBeeper(self, street, avenue, byUser = True) :
        """Remove a single beeper from this corner. An exception will be raised if there are none"""
        place = (street, avenue)
        howMany = self._beepers.get(place, 0)
        if howMany > 0 :
            howMany -= 1
            if howMany == 0 :
                self._beepers[place] = howMany #TODO: replace this with .pop(place)
            else:
                self._beepers[place] = howMany
        elif howMany == infinity :
            return
        else :
            raise NoBeepers("(" + str(street) + ", " + str(avenue) + ")")
        
        
#    def _visible(self, x, y, xBound, yBound):
#        return x >= 0 and y >= 0 and x < xBound and y < yBound
        

    def setSize(self, numberOfStreets=10, numberOfAvenues=10):
#        raise NotImplementedError("Set size needs to be implemented") # default 10 by 10
        pass #unneeded, the world is infinite
    
    def setVisible(self, visible = True):
        self._isVisible = visible
#        raise NotImplementedError("SetVisible needs to be implemented") # true to show, false to hide
    
    def isVisible(self):
        return self._isVisible
    
    def showBuilder(self):
        pass #TODO: add this
        
    def showSpeedControl(self, visible = True):
        pass #TODO: add this
 
world = RobotWorld("Karel's Robot World")   

if __name__ =='__main__':

    world.readWorld('../V2World.kwld')
    world.showWorldWithRobots()

