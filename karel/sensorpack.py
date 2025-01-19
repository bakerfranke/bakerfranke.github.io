""" Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

Defines the "package" of sensors that Robots descended from UrRobot 
implement. Not really needed, but collected the requirements in one place.

These are all pure functions so that none of them has any effect on the state of
the robot or of the world. 
"""
#from exceptions import NotImplementedError

class _SensorPack :
    "Adds sensing facilities to robots, but otherwise these behave just like UrRobots."
        
    def anyBeepersInBeeperBag(self):
        "Return true if there are beepers carried by this robot."
        raise NotImplementedError("anyBeepersInBeeperBag not yet implemented.")   
    
    def nextToABeeper(self):
        "Return true if there are beepers on the current corner."
        raise NotImplementedError("nextToABeeper not yet implemented.")    
    
    def facingNorth(self):
        "Return true if this robot is facing north."
        raise NotImplementedError("facingNorth not yet implemented.")    
    
    def facingEast(self):
        "Return true if this robot is facing east."
        raise NotImplementedError("facingEast not yet implemented.")    
    
    def facingSouth(self):
        "Return true if this robot is facing south."
        raise NotImplementedError("facingSouth not yet implemented.")    
    
    def facingWest(self):
        "Return true if this robot is facing west."
        raise NotImplementedError("facingWest not yet implemented.")    
    
    def frontIsClear(self):
        "Return true if there is no wall immediately in front of this robot."
        raise NotImplementedError("frontIsClear not yet implemented.")    
    
    def nextToARobot(self):
        "Return true if there are any other robots on the current corner."
        raise NotImplementedError("nextToARobot not yet implemented.")    
