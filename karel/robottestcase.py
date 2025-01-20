"""  Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

Provides unittest assertions specific to robots and the world
"""

from unittest import TestCase
from karel.robota import world
from karel.robota import North
from karel.robota import West
from karel.robota import South
from karel.robota import East
from karel.robotutils import direction_strings
#from exceptions import Exception



class RobotException(Exception) :
    def __init__(self, message):
        self.message = message
        
    def __repr__(self):
        return "RobotException: " + self.message

class RobotTestCase(TestCase):
    def __init__(self, methodName):
        TestCase.__init__(self, methodName)

    # def getStreet(self, robot):
    #     return robot._UrRobot__street
    
    # def getAvenue(self, robot):
    #     return robot._UrRobot__avenue

    # def getLocation(self, robot):
    #     return (robot._UrRobot__street, robot._UrRobot__avenue)
    
    # def getDirection(self, robot):
    #     return robot._UrRobot__direction
    
    # def getDirectionStr(self, robot):
    #     return direction_strings[robot._UrRobot__direction]
    
    # def _status_to_str(self, status):
    #     return (status[0], 
    #             status[1],
    #             direction_strings[status[2]],
    #             status[3])
    
    # def getBeepers(self, robot):
    #     return robot._UrRobot__beepers

    def _getStatus(self, robot):
        return (robot._UrRobot__street, 
                robot._UrRobot__avenue,
                robot._UrRobot__direction,
                robot._UrRobot__beepers)
    
    def assertStatus(self, robot, expected_status):
        curr_status = self._getStatus(robot)
        if curr_status != expected_status:
            raise RobotException(f"Robot status: {self._status_to_str(curr_status)}. Expected: {self._status_to_str(expected_status)}")
    
    def _createException(msg, value, expected):
        return RobotException(f"{msg} Value: {value}. Expected: {expected}")
    
    def assertKarel(self, msg, value, expected):
        # print("in assertKarel ",msg,value,expected)
        # print(f"\t{value}!={expected}? {value!=expected}")

        if value!=expected:
            raise RobotException(f"{msg} Value: {value}. Expected: {expected}")


    def assertDirection(self, robot, expected_direction):
        value = robot._UrRobot__direction
        if  value != direction:
            return self._createException("Checking direction:",)

    def assertNotFacingNorth(self, robot):
        if robot._UrRobot__direction == North :
            raise RobotException( "Facing north")

    def assertFacingNorth(self, robot):
        if not robot._UrRobot__direction == North :
            raise RobotException( "Not facing north")
        
    def assertNotFacingEast(self, robot):
        if robot._UrRobot__direction == East:
            raise RobotException( "Facing east")
        
    def assertFacingEast(self, robot):
        if not robot._UrRobot__direction == East :
            raise RobotException( "Not facing east")
        
    def assertFacingWest(self, robot):
        if not robot._UrRobot__direction == West :
            raise RobotException( "Not facing west")
        
    def assertNotFacingWest(self, robot):
        if robot._UrRobot__direction == West :
            raise RobotException( "Facing west")
        
    def assertFacingSouth(self, robot):
        if not robot._UrRobot__direction == South :
            raise RobotException( "Not facing south")
        
    def assertNotFacingSouth(self, robot):
        if robot._UrRobot__direction == South :
            raise RobotException( "Facing south")
        
    def assertAt(self, robot, street, avenue):
        self.assertOnStreet(robot, street)
        self.assertOnAvenue(robot, avenue)
    
    def assertNotAt(self, robot, street, avenue):
        if robot._UrRobot__street == street and robot._UrRobot__avenue == avenue:
            raise RobotException( "Robot at (" + str(street)+ ", " + str(avenue) + ")")
            
    def assertOnStreet(self, robot, street):
        if robot._UrRobot__street != street :
            raise RobotException( "Robot not on street: " + str(street))
    
    def assertNotOnStreet(self, robot, street):
        if robot._UrRobot__street == street :
            raise RobotException( "Robot on street: " + str(street))
    
    def assertOnAvenue(self, robot, avenue):
        if robot._UrRobot__avenue != avenue :
            raise RobotException( "Robot not on avenue: " + str(avenue))
    
    def assertNotOnAvenue(self, robot, avenue):
        if robot._UrRobot__avenue == avenue :
            raise RobotException( "Robot on avenue: " + str(avenue))
    
    def assertHasNeighbor(self, robot):
        if robot.neighbors() == []:
            raise RobotException( "Robot has no neighbors")
    
    def assertHasNoNeighbor(self, robot):
        if robot.neighbors() != [] :
            raise RobotException( "Robot has neighbors")

    def assertNextToABeeper(self, robot) :
        if not world._beepersAt(robot._UrRobot__street, robot._UrRobot__avenue) :
            raise RobotException( "Robot is not next to a beeper")
    
    def assertNotNextToABeeper(self, robot):
        if world._beepersAt(robot._UrRobot__street, robot._UrRobot__avenue) :
            raise RobotException( "Robot is next to a beeper")

    def assertBeepersInBeeperBag(self, robot):
        if robot._UrRobot__beepers == 0 :
            raise RobotException( "Robot has no beepers in its beeper bag")
    
    def assertNoBeepersInBeeperBag(self, robot):
        if robot._UrRobot__beepers != 0 :
            raise RobotException( "Robot has some beepers in its beeper bag")

    def assertFrontIsClear(self, robot):
        if not world._clearBefore(robot) :
            raise RobotException( "Robot's front is blocked")
        
    def assertFrontIsBlocked(self, robot):
        if world._clearBefore(robot) :
            raise RobotException( "Robot's front is clear")

    def assertRunning(self, robot):
        if not robot._UrRobot__running :
            raise RobotException( "Robot is not running")
    
    def assertNotRunning(self, robot):
        if robot._UrRobot__running :
            raise RobotException( "Robot is running")
        
    """ Two assertions about the world
    """
    
    def assertBeepersAt(self, street, avenue): 
        if not world._beepersAt(street, avenue) :
            raise RobotException( "Expected beepers at (" + str(street)+ ", " + str(avenue) + ") but not there.")
    
    def assertNoBeepersAt(self, street, avenue):
        if world._beepersAt(street, avenue) :
            raise RobotException( "Expected NO beepers at (" + str(street)+ ", " + str(avenue) + ") but at least one was there.")

    def assertBeeperList(self, expectedBeepers):
        allBeepers = world.getAllBeepers();
        if allBeepers != expectedBeepers:
            raise RobotException(f"Expected Beepers at: {expectedBeepers}, but found: {allBeepers}")


#if __name__ == '__main__':
#    for i in dir(RobotTestCase):
#        print(i)
        