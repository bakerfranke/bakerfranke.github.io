''' Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

The base class of all the robot worlds. It is abstract and
implements all common routines. 
'''
import sys
#import thread
import threading
#import karel.robota
import time
from karel.basicdefinitions import legalCorner
from karel.basicdefinitions import NoRobots
from karel.basicdefinitions import NoBeepersInBeeperBag
from karel.basicdefinitions import RobotNotRunning
from karel.basicdefinitions import FrontIsBlocked            
from karel.basicdefinitions import NoBeepers            

from karel.basicdefinitions import North
from karel.basicdefinitions import South
from karel.basicdefinitions import East
from karel.basicdefinitions import West

_displayCharacter = { North: " ^ ", East: " > ", South: " v ", West: "<  " }



class RobotWorldBase:
    


    def name(self):
        pass # in subclasses

    _runnables = []    
    
    def setupThread(self, robot): # MANUALTEST: Must be tested manually
        """ This will set up any object with a 0 argument "run" method to run in a 
        separate thread. The thread is created here and they are all started
        together with world.startThreads(). UrRobots have such a method. Just override it
        to define what your robot should do in its thread. 
        """
        thread = threading.Thread(target = robot.run)
        self._runnables.append(thread)
        return thread

    def startThreads(self, delay = 0.0): # MANUALTEST: Must be tested manually
        "Start all the threads that have been installed using setupThread"
#        World.startThreads() # not public
        if delay > 0.0 :
            when = delay / 10.0
            print ("Starting in " + str(when) + " seconds.")
            time.sleep(when)
        for thread in self._runnables :
            thread.start()
        # TODO: find a way to pause these threads i.e. stop/restart
    
    def reset(self):
        "Remove all robots, walls and beepers from the world."
        self._beepers = {}
        self._eastWestWalls = {}
        self._northSouthWalls = {}
        self.resetRobots()
        
    def resetRobots(self):
        "Remove all of the robots from the world"
        self._robots = {} 
        
    def showBeepers(self):
        for (street, avenue) in self._beepers.keys()  :
            howMany = self._beepers[(street, avenue)]
            print (str(howMany) + " beeper(s) at (" + str(street) + ", " + str(avenue) + ")")
        
            
    def assertBeepersAt(self, street, avenue, atLeast=1):
        "Fail unlesss there are at least so many beepers on this corner"
        number = self._beepers.get((street, avenue), 0)
        if number < 0 :
            return         
        if atLeast > number or (atLeast < 0 and number >= 0):
            rep = str(atLeast)
            if atLeast < 0 :
                rep = "infinity"
            raise NoBeepers("There are not at least " + rep + " beepers at (" + str(street) + ", " + str(avenue) + ")")
        
    def assertRobotsAt(self, street, avenue):
        "Fail unless there is at least one robot on this corner"
        for x in self._robots.keys() :
            if (x._UrRobot__street, x._UrRobot__avenue) == (street, avenue) :
                return
        raise NoRobots("There are no robots at (" + str(street) + ", " + str(avenue) + ")")
        
        
    def _beepersAt(self, street, avenue) :
        return self._beepers.get((street, avenue), 0) != 0
        
    def _robotsAt(self, street, avenue):
        for x in self._robots.keys() :
            if (x._UrRobot__street, x._UrRobot__avenue) == (street, avenue) :
                return True
        return False
        
    def placeEWWall(self, northOfStreet, atAvenue, lengthTowardEast):
        for i in range(0, lengthTowardEast) :
            self.placeWallNorthOf(northOfStreet, atAvenue + i)
        
    def placeNSWall(self, atStreet, eastOfAvenue, lengthTowardNorth):
        for i in range(0, lengthTowardNorth) :
            self.placeWallEastOf(atStreet + i, eastOfAvenue)
        
    def showWalls(self):
        for (street, avenue) in self._eastWestWalls.keys()  :
            print ("East-West wall north of corner (" + str(street) + ", " + str(avenue) + ")")
        for (street, avenue) in self._northSouthWalls.keys()  :
            print ("North-South wall east of corner (" + str(street) + ", " + str(avenue) + ")")

    def _registerRobot(self, robot):
        self._robots[robot] = (robot._UrRobot__street, robot._UrRobot__avenue)
        
    def _clearNorthOf(self, street, avenue):
        legalCorner(street, avenue)
        return self._eastWestWalls.get((street, avenue), 0) == 0

    def _clearSouthOf(self, street, avenue):
        legalCorner(street, avenue)
        if street == 1 :
            return False
        return self._eastWestWalls.get((street - 1, avenue), 0) == 0

    def _clearEastOf(self, street, avenue):
        legalCorner(street, avenue)
        return self._northSouthWalls.get((street, avenue), 0) == 0

    def _clearWestOf(self, street, avenue):
        legalCorner(street, avenue)
        if avenue == 1 :
            return False
        return self._northSouthWalls.get((street, avenue - 1), 0) == 0
    
    def _neighborsOf(self, robot):
        result = []
        for anyRobot in self._robots.keys() :
            if anyRobot != robot and (anyRobot._UrRobot__street, anyRobot._UrRobot__avenue) == (robot._UrRobot__street, robot._UrRobot__avenue) :
                result.append(anyRobot)
        return result
    
    def readWorld(self, filename):
        "Read a world file that includes the locations of walls and beepers"
        allLines = open(filename).readlines() # an array of strings termined by newliens
        #print(allLines)
        for line in allLines: #open(filename).readlines() :
            words = line.split(" ")
            key = words[0]
            if key == "beepers" :
                self.placeBeepers(int(words[1]), int(words[2]), int(words[3]))
            elif key == "eastwestwalls" :
                street = int(words[1])
                avenue = int(words[2])                             
                while avenue <= int(words[3]) :
                    self.placeWallNorthOf(street, avenue)
                    avenue += 1
            elif key == "northsouthwalls" :
                street = int(words[2])
                avenue = int(words[1])
                while street <= int(words[3]) :
                    self.placeWallEastOf(street, avenue)
                    street += 1
        print("Loaded:",filename)
    def readWorldWithPath(self, path, filename):
        pass
                                             
    def saveWorldWithPath(self, path, filename):
        pass

    def getWorldAsLines(self):
        "Get a string of the lines that would be written to a file"
                                             
    def saveWorld(self, filename):
        "Write a readable representation of the world (without robots) to a file"
        lines = self.getWorldString()
        writer = open(filename, "w")
        for line in lines :
            writer.write(line)
        writer.close();  
        
    def getWorldString(self):
        "Get a string of the lines that would be written to a file"
        
        lines = []
        lines.append("KarelWorld\n")
        for  (x,y) in self._beepers.keys() :
            lines.append("beepers " + str(x) + " " + str(y) + " " + str(self._beepers[(x,y)]) + "\n")
        for (x, y) in self._eastWestWalls.keys() :
            lines.append("eastwestwalls " + str(x) + " " + str(y) + " " + str(y) + "\n")
        for (x, y) in self._northSouthWalls.keys():
            lines.append("northsouthwalls " + str(y) + " " + str(x) + " " + str(x) + "\n")
        
        return lines
        
    def _clearBefore(self, robot):
        direction = robot._UrRobot__direction
        street = robot._UrRobot__street
        avenue = robot._UrRobot__avenue
        if direction == North and self._clearNorthOf(street, avenue) :
            return True
        elif direction == East and self._clearEastOf(street, avenue) :
            return True
        elif direction == South and self._clearSouthOf(street, avenue) :
            return True
        elif direction == West and self._clearWestOf(street, avenue) :
            return True
        else :
            return False

        
    def _getDisplay(self, startStreet, startAvenue, streetsTowardNorth, avenuesTowardEast): 
        """ This two dimensional structure has the following properties. Its size is 
        Every other row and every other column is initially blank. Each cell is a three char string.
        Odd numbered rows are initially blank, Even numbered columns are initially blank.
        The first row will be imaged at the bottom of the output. The first column at the left.
        The blank rows and columns will eventually hold symbols for walls. 
        Only one symbol can appear in a cell. The entries for corners "." are added first with beepers
        next and finally robots. The last symbol added is the one shown when the display is printed. 
        """     
        xBound = 2 * streetsTowardNorth + 1
        yBound = 2 * avenuesTowardEast + 1
                
        display = []
        for i in range(0, xBound):
            display.append([]) # a row
            display.append([]) # a row
            for j in range(0, avenuesTowardEast + 1):
                display[2*i + 1].append(" . ") 
                display[2*i + 1].append("   ")
                display[2*i].append("   ")
                display[2*i].append("   ")
        #beepers
        for (x,y) in self._beepers.keys() :
            howMany = self._beepers[(x,y)]
            if howMany > 9 :
                cell = " * "
            elif howMany < 0 :
                cell = "inf"
            elif howMany > 0 :
                cell = " " + str(howMany)[0] + " "
            else :
                cell = " . "
            x = 2 * (x - startStreet) + 1
            y = 2 * (y - startAvenue)
            if self._visible(x, y, xBound, yBound):
                display[x][y] = cell       
        #boundary walls
        bottom = 2 * (1 - startStreet)
        left = 2 * (1 - startAvenue)
        if bottom >= 0 and bottom < xBound :
            for i in range(0, yBound) :
                display[bottom][i] = "___"
        if left >= 1 and left < yBound :
            for  i in range(0, xBound - 1) :
                display[i+1][left-1] = display [i][left-1]= "|"
        #eastwestwalls
        for (x, y) in self._eastWestWalls.keys() :
            x = 2 * (x - startStreet) + 1
            y = 2 * (y - startAvenue)
            if self._visible (x + 1, y, xBound, yBound) :
                display[x + 1][y] = "___"       
        #northsouthwalls
        for (x, y) in self._northSouthWalls.keys() :
            bottom = x
            x = 2 * (x - startStreet);
            y = 2 * (y - startAvenue) + 1;
            if self._visible(x + 1, y, xBound, yBound) :
                display[x + 1 ][y] = display[x][y] = " | "
                if bottom == 1 :
                    display[x][y] = "_|_"
        return display
    
    def _dumpDisplay(self, display, startStreet, startAvenue,  streetsTowardNorth, avenuesTowardEast):
        """ Image the display with the first row at the bottom
        """
        lines = []
        i = 2 * streetsTowardNorth
        while i >= 0 :
            if startAvenue == 1 :
                line = " |"
            else :
                line = " "
            for j in range(0, 2*avenuesTowardEast) :
                line += display[i][j]
            lines.append( line)
            i -= 1
        lines.append("")
        lines.append( "Lower left corner is street: " + str(startStreet) + " avenue: " + str(startAvenue) + ".")
        lines.append("")
        for line in lines :
            print (line)
    
    def showWorld(self, startStreet=1, startAvenue=1, streetsTowardNorth=10, avenuesTowardEast=10):
        "Print a representation of the world (walls, corners, beepers) on std out"
        display = self._getDisplay(startStreet, startAvenue, streetsTowardNorth, avenuesTowardEast)
        self._dumpDisplay(display, startStreet, startAvenue, streetsTowardNorth, avenuesTowardEast)
    
    def getAllBeepers(self):
        return self._beepers
    
    def getAllRobots(self):
        robot_list = []
        for robot in self._robots:
            robot_dict = {}
            robot_dict['id'] = robot._UrRobot__ID
            robot_dict['location'] = self._robots[robot]
            robot_dict['direction'] = robot._UrRobot__direction.__name__
            robot_dict['beepers'] = robot._UrRobot__beepers
            robot_list.append(robot_dict)
        return robot_list

    def showRobots(self):
        for r in self.getAllRobots():

        # for robot in self._robots:

            print(
                f"Robot {r['id']} at {r['location']} facing {r['direction']}"
                f" with {r['beepers']} beeper(s)"
            )
        
    def showBeepers(self):
        locs = list(self._beepers.keys())
        locs.sort()
        for loc in locs:
            print(f"{self._beepers[loc]} Beeper(s) at {loc}")
        
    def showWorldWithRobots(self, startStreet=1, startAvenue=1, streetsTowardNorth=10, avenuesTowardEast=10):
        "Print a representation of the world including robots to std out"
        display = self._getDisplay(startStreet, startAvenue, streetsTowardNorth, avenuesTowardEast)
        xBound = 2 * streetsTowardNorth + 1
        yBound = 2 * avenuesTowardEast + 1
        for robot in self._robots.keys() :
            (x,y) = self._robots[robot]
            x = 2 * (x - startStreet) + 1
            y = 2 * (y - startAvenue)
            direction = robot._UrRobot__direction
            global _displayCharacter
            cell = _displayCharacter[direction]
            if self._visible(x, y, xBound, yBound):
                display[x][y] = cell       
        self._dumpDisplay(display, startStreet, startAvenue, streetsTowardNorth, avenuesTowardEast)

    def _visible(self, x, y, xBound, yBound):
        return x >= 0 and y >= 0 and x < xBound and y < yBound
    
#Specialize the following to draw the graphics

    def placeWallNorthOf(self, street, avenue):
        raise NotImplementedError("Implemented in subclass.") 
    
    def placeWallEastOf(self, street, avenue) :
        raise NotImplementedError("Implemented in subclass.") 

    def placeBeepers(self, street, avenue, howMany=1, byUser = True):
        raise NotImplementedError("Implemented in subclass.") 
    
   
