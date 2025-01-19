""" Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License
"""



infinity = -1
#INFINITE = infinity # Deprecated, use infinity


#exceptions
class NoBeepers(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)
        self.message = message
    def __repr__(self):
        return "No beepers on corner: " + str(self.message)
    def __str__(self):
        return repr("No beepers on corner: " + self.message)
    
class IllegalCorner(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)
        self.message = message
    
    def __repr__(self):
        return "That corner is not in the world: " + str(self.message)
    
class NoRobots(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)
        self.message = message
    def __repr__(self):
        return "No robots on corner: " + str(self.message)
# exceptions
class NoBeepersInBeeperBag(Exception) :
    def __repr__(self):
        return "No beepers in beeper bag"
    
class RobotNotRunning(Exception) :
    def __init__(self, message):
        Exception.__init__(self, message)
        self.message = message
    def __repr__(self):
        return "Robot not running: " + str(self.message)
        
class FrontIsBlocked(Exception) :
    def __init__(self, message):
        Exception.__init__(self, message)
        self.message = message
    def __repr__(self):
        return "Front is Blocked: " + str(self.message)

#assertions
def legalCorner(street, avenue):
    "Assert that this is a legal corner."
    if( street < 1 or avenue < 1) :
        raise IllegalCorner("(" + str(street) + ", " + str(avenue) + ")") 
    
    
def North(robot, world):
    "Represents the north direction in the robot world."
    if world._clearNorthOf(robot._UrRobot__street, robot._UrRobot__avenue) :
        robot._UrRobot__street += 1
    else :
        robot.turnOff()
        raise FrontIsBlocked( "at (" + str(robot._UrRobot__street) + ", " + str(robot._UrRobot__avenue) + ")" + 
            " facing north" )
        
def South(robot, world):
    "Represents the south direction in the robot world."
    if world._clearSouthOf(robot._UrRobot__street, robot._UrRobot__avenue) :
        robot._UrRobot__street -= 1
    else :
        robot.turnOff()
        raise FrontIsBlocked( "at (" + str(robot._UrRobot__street) + ", " + str(robot._UrRobot__avenue) + ")" + 
            " facing south")
       
def East(robot, world):
    "Represents the east direction in the robot world."
    if world._clearEastOf(robot._UrRobot__street, robot._UrRobot__avenue) :
        robot._UrRobot__avenue += 1
    else :
        robot.turnOff()
        raise FrontIsBlocked( "at (" + str(robot._UrRobot__street) + ", " + str(robot._UrRobot__avenue) + ")" + 
            " facing east")
       
def West(robot, world):
    "Represents the west direction in the robot world."
    if world._clearWestOf(robot._UrRobot__street, robot._UrRobot__avenue) :
        robot._UrRobot__avenue -= 1
    else :
        robot.turnOff()
        raise FrontIsBlocked( "at (" + str(robot._UrRobot__street) + ", " + str(robot._UrRobot__avenue) + ")" + 
            " facing west")
        

_nextDirection = {North: West, West: South, South: East, East: North}
