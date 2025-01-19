#!/usr/bin/env jpython
""" Copyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

 Tests for robota and the World class. 

    Note that we have several assertions in each test. This is not standard practice, as a test will 
    fail when its first assertion fails, though other tests will still be run. So when you do it this
    way and a test fails, you may have a lot of work to do to clean up things: not just the failed
    assertion, but other things that weren't tested because they followed that assertion. One per test
    is a better plan. 
"""

#import sys, os

from karel.robota import North
from karel.robota import East
from karel.robota import South
from karel.robota import West
from karel.robota import world
from karel.robota import Robot
from karel.robota import UrRobot
from karel.robota import FrontIsBlocked
from karel.robota import NoBeepersInBeeperBag
from karel.robota import RobotNotRunning
from karel.robota import _RobotSkeleton
from karel.sensorpack import _SensorPack

from karel.robota import graphics 
from karel.robota import noGraphics
from karel.robota import tkGraphics

from karel.basicdefinitions import infinity
from karel.basicdefinitions import IllegalCorner
from karel.basicdefinitions import NoBeepers
from karel.basicdefinitions import NoRobots

if  graphics == noGraphics:
    from karel.robotworld import RobotWorld
else :
    from karel.tkworldadapter import RobotWorld
    from karel.tkworldadapter import _window

from karel.basicdefinitions import NoBeepersInBeeperBag
from karel.basicdefinitions import RobotNotRunning
from karel.basicdefinitions import FrontIsBlocked            


from robottestcase import RobotTestCase
from robottestcase import RobotException

from observable import Observer

import unittest

## Patch paths to pyunit and standard C-python modules; adapt to your machine!
#sys.path.insert(0, os.path.dirname(os.getcwd())) # i.e. '..'
#sys.path.insert(0,'/usr/lib/python1.5')

class RobotaTest(RobotTestCase):
    
    
    def setUp(self):
        world.setSize(10, 10)
        world.reset()
        world.setDelay(0)
        self.karel = UrRobot(5, 5, North, 0)
        world.setVisible(0) #Doesn't work. It is reset visible whenever Robota is loaded again. 
        
    def testReadWorld(self):
        "assure the elements read are all present"
        world.readWorld("../stairs.kwld")
        self.assertEqual(world._beepers[(2,2)], 1, "No beeper here")
        self.assertEqual(world._eastWestWalls[(3,4)], 1, "No top step")
        self.assertEqual(world._eastWestWalls[(2,3)], 1, "No mid step")
        self.assertEqual(world._eastWestWalls[(1,2)], 1, "No lower step")
        self.assertEqual(world._northSouthWalls[(1,1)], 1, "No left step")
        self.assertEqual(world._northSouthWalls[(1,4)], 1, "No right step")
        self.assertEqual(world._northSouthWalls[(2,2)], 1, "No left step")
        self.assertEqual(world._northSouthWalls[(2,4)], 1, "No right step")
        self.assertEqual(world._northSouthWalls[(3,3)], 1, "No left step")
        self.assertEqual(world._northSouthWalls[(3,4)], 1, "No right step")
        
#    def testWindow(self):
#        if graphics == tkGraphics:
#            self.assertTrue(_window != None)
        
    def testWorldName(self):
        "Assure that the name of the world can be defined."
        tempWorld = RobotWorld("Uranus")
        self.assertEqual(tempWorld.name(), 'Uranus')
        self.assertEqual(world.name(), "Karel's World")
        
    def testWorldAssertions(self):
        try:
            world.assertRobotsAt(8, 8)
            self.fail ("No Robots")
        except NoRobots :
            pass
        world.assertBeepersAt(0, 0, 0)
        try:
            world.assertBeepersAt(0, 0, 1)
            self.fail ("Not enough beepers")
        except NoBeepers :
            pass
        world.assertRobotsAt(5, 5)
        world.placeBeepers(3, 3, 3)
        world.assertBeepersAt(3, 3, 0)
        world.assertBeepersAt(3, 3, 1)
        world.assertBeepersAt(3, 3, 3)
        try:
            world.assertBeepersAt(3, 3, 4)
            self.fail ("Not enough beepers")
        except NoBeepers :
            pass
        try:
            world.assertBeepersAt(3, 3, infinity)
            self.fail ("Not enough beepers")
        except NoBeepers :
            pass
        world.placeBeepers(3, 3, infinity) #infinite
        world.assertBeepersAt(3, 3, infinity)
        world.assertBeepersAt(3, 3, 0)
        world.assertBeepersAt(3, 3, 3)

#        self.assertRaises(NoRobots, world.assertRobotsAt(8, 8))
#        self.assertRaises(NoBeepers, world.assertBeepersAt(0, 0, 1))
        

    def testNotImplemented(self):
        "Assure that the non-implemented instructions are all in place"
        karel = _RobotSkeleton()
        self.assertRaises(NotImplementedError, karel.move)
        self.assertRaises(NotImplementedError, karel.turnLeft)
        self.assertRaises(NotImplementedError, karel.turnOff)
        self.assertRaises(NotImplementedError, karel.pickBeeper)
        self.assertRaises(NotImplementedError, karel.putBeeper)
        
        carl = _SensorPack()
        self.assertRaises(NotImplementedError, carl.anyBeepersInBeeperBag)
        self.assertRaises(NotImplementedError, carl.nextToABeeper)
        self.assertRaises(NotImplementedError, carl.facingNorth)
        self.assertRaises(NotImplementedError, carl.facingWest)
        self.assertRaises(NotImplementedError, carl.facingSouth)
        self.assertRaises(NotImplementedError, carl.facingEast)
        self.assertRaises(NotImplementedError, carl.nextToARobot)
        self.assertRaises(NotImplementedError, carl.frontIsClear)
            
    def testRemovaAllRobots(self):
        "Remove all robots from world"
        world.resetRobots()
        self.assertEqual(world._robotsAt(5, 5), 0)
        
    def testActionsWhenTurnedOff(self) :
        "Actions should all fail when robot turned off"
        self.karel.turnOff();
        self.assertRaises(RobotNotRunning, self.karel.move)
        self.assertRaises(RobotNotRunning, self.karel.turnLeft)
        self.assertRaises(RobotNotRunning, self.karel.pickBeeper)
        self.assertRaises(RobotNotRunning, self.karel.putBeeper)
        
        lost = UrRobot(1, 1, West, 1)
        self.assertRaises(FrontIsBlocked, lost.move)

        self.assertRaises(RobotNotRunning, lost.move)
        self.assertRaises(RobotNotRunning, lost.turnLeft)
        self.assertRaises(RobotNotRunning, lost.pickBeeper)
        self.assertRaises(RobotNotRunning, lost.putBeeper)
   
    def testNextToARobot(self):
        "Next to a robot when present and when not"
        #Note that the robots from other tests still exist in the world as it isn't cleared of robots.
        world.resetRobots()
        self.karel = Robot(12, 12, North, 0)
        self.assertHasNoNeighbor(self.karel)
        self.assertEqual(len(self.karel.neighbors()), 0)
        charlie = Robot(12, 12, East, 0)
        self.assertEqual(len(self.karel.neighbors()), 1)
        self.assertEqual(self.karel.neighbors()[0], charlie)
        self.assertEqual(charlie.neighbors()[0], self.karel)
        self.assert_(charlie.nextToARobot())
        self.assert_(self.karel.nextToARobot())
        self.assertHasNeighbor(self.karel)
        self.assertHasNeighbor(charlie)
        charlie.move()
        self.assertHasNoNeighbor(self.karel)
        self.assertHasNoNeighbor(charlie)
        self.assert_(not charlie.nextToARobot())
        self.assert_(not self.karel.nextToARobot())
                
    def testRobotPredicates(self):
        "Validate all of the predicates in class Robot"
        self.karel = Robot(5, 5, North, 0) # has to be a Robot here
        self.assertEqual(self.karel.anyBeepersInBeeperBag(), 0)
        self.assertEqual(self.karel.nextToABeeper(), 0)
        self.assertEqual(self.karel.facingNorth(), 1)
        self.assertEqual(self.karel.facingWest(), 0)
        self.assertEqual(self.karel.facingSouth(), 0)
        self.assertEqual(self.karel.facingEast(), 0)
        self.assertEqual(self.karel.frontIsClear(), 1)
        martha = UrRobot(5, 5, North, 0)
        self.assertEqual(self.karel.nextToARobot(), 1)
        world.placeWallNorthOf(5, 5)
        self.assertEqual(self.karel.frontIsClear(), 0)
        self.karel.turnLeft()
        self.assertEqual(self.karel.facingNorth(), 0)
        self.assertEqual(self.karel.facingWest(), 1)
        self.assertEqual(self.karel.frontIsClear(), 1)
        world.placeWallEastOf(5, 4)
        self.assertEqual(self.karel.frontIsClear(), 0)
        self.karel.turnLeft()
        self.assertEqual(self.karel.facingWest(), 0)
        self.assertEqual(self.karel.facingSouth(), 1)
        self.assertEqual(self.karel.frontIsClear(), 1)
        world.placeWallNorthOf(4, 5)
        self.assertEqual(self.karel.frontIsClear(), 0)
        self.karel.turnLeft()
        self.assertEqual(self.karel.facingSouth(), 0)
        self.assertEqual(self.karel.facingEast(), 1)
        self.assertEqual(self.karel.frontIsClear(), 1)
        world.placeWallEastOf(5, 5)
        self.assertEqual(self.karel.frontIsClear(), 0)
        charlie = Robot(12, 12, North, 1)
        rosie = UrRobot(12, 12, East, 0)
        self.assertEqual(charlie.anyBeepersInBeeperBag(), 1)
        charlie.putBeeper()
        self.assertEqual(charlie.anyBeepersInBeeperBag(), 0)
        charlie.pickBeeper()
        self.assertEqual(charlie.anyBeepersInBeeperBag(), 1)
        self.assertEqual(charlie.nextToARobot(), 1)
        charlie.move()
        charlie.move()
        self.assertEqual(charlie.nextToARobot(), 0)
        self.assertNoBeepersAt(9, 9)
        world.placeBeepers(9, 9, 1)
        self.assertBeepersAt(9, 9)

    def testPausing(self):
        "this is a partial test of pausing"
        self.assertEqual(self.karel._UrRobot__pausing, 0)
        self.assertEqual(self.karel._UrRobot__userPausing, 0)
        self.karel.setPausing(1)
        self.assertEqual(self.karel._UrRobot__pausing, 1)
        self.karel.setPausing(0)
        self.assertEqual(self.karel._UrRobot__pausing, 0)
        self.karel.setUserPausing(1)
        self.assertEqual(self.karel._UrRobot__userPausing, 1)
        self.karel.setUserPausing(0)
        self.assertEqual(self.karel._UrRobot__userPausing, 0)
        # TODO: does not test the effect of this, just the setting. Test the effect manually

        
    class ObsTemp(Observer):
        def update(self, observable, data):
            print ('------ Manual Check-------->done')
            
    class StateCheck(Observer):
        def update(self, observable, data): #used just after karel moves
            assert data.action() == UrRobot.moveAction
            assert data.street() == 6
            assert data.avenue() == 5
            assert data.beepers() == 0
            assert data.isRunning() != 0
            assert data.direction() == North            

    def testObservable(self):
        "Observers should get signaled when robot changes state, etc. All observable methods"
        self.assertEqual(self.karel.countObservers(), 1)
        self.assertEqual(self.karel.hasChanged(), 0)
        self.karel.setChanged()
        self.assertEqual(self.karel.hasChanged(), 1)
        self.karel.notifyObservers(None);
        self.karel.clearChanged()
        self.assertEqual(self.karel.hasChanged(), 0)
        self.karel.deleteObserver(world)
        self.assertEqual(self.karel.countObservers(), 0)
        self.karel.addObserver(world)
        self.assertEqual(self.karel.countObservers(), 1)
        self.karel.deleteObservers()
        self.assertEqual(self.karel.countObservers(), 0)
        self.karel.addObserver(self.ObsTemp())
        self.karel.setChanged()
        print()
        print ("Manual Check, should produce ...done")
        self.karel.notifyObservers(0);
        # test robotStates
        check = self.StateCheck()
        self.karel.addObserver(check)
        self.karel.move()
        

    def testMoveAroundTheBlock(self):
        "Robot move around block when clear"
        self.karel.move()
        self.assertFacingNorth(self.karel)
        self.assertRunning(self.karel)
        self.assertFrontIsClear(self.karel)
        self.assertAt(self.karel, 6, 5)
        self.karel.turnLeft()
        self.assertFacingWest(self.karel)
        self.karel.move()
        self.assertAt(self.karel, 6, 4)
        self.karel.turnLeft()
        self.assertFacingSouth(self.karel)
        self.karel.move()
        self.assertAt(self.karel, 5, 4)
        self.karel.turnLeft()
        self.assertFacingEast(self.karel)
        self.karel.move()
        self.assertAt(self.karel, 5, 5)
        self.karel.turnLeft()
        self.assertFacingNorth(self.karel)
        self.assertNoBeepersInBeeperBag(self.karel)
        
    def testMoveWhenBlocked(self):
        "Move when blocked by boundary wall"
        robot = Robot(1, 1, West, 0)
        self.assertFrontIsBlocked(robot)
        self.assertRaises(FrontIsBlocked, robot.move)
        
    def testMoveWhenBlockedGeneral(self):
        "Move when blocked by normal wall"
        world.placeWallEastOf(5, 5)
        world.placeWallEastOf(5, 4)
        world.placeWallNorthOf(5, 5)
        world.placeWallNorthOf(4, 5)
        self.assertRaises(FrontIsBlocked, self.karel.move)
        self.karel = Robot(5, 5, West, 0)
        self.assertRaises(FrontIsBlocked, self.karel.move)
        self.karel = Robot(5, 5, South, 0)
        self.assertRaises(FrontIsBlocked, self.karel.move)
        self.karel = Robot(5, 5, East, 0)
        self.assertRaises(FrontIsBlocked, self.karel.move)
        
    def testInfiniteBeepersInWorld(self):
        "Infinite beepers in world"
        world.placeBeepers(5, 5, infinity)
        self.karel.pickBeeper()
        self.assertEqual( world._beepers[(5,5)], infinity, "World lacks infinite beepers")
        self.karel.putBeeper()
        self.assertEqual( world._beepers[(5,5)], infinity, "World lacks infinite beepers")
        
    def testInfiniteBeepersInRobot(self):
        "Robot has infinite beepers"
        robot = Robot(1, 1, North, infinity)
        robot.putBeeper()
        self.assertEqual( robot._UrRobot__beepers, infinity, "Robot lacks infinite beepers")
        robot.pickBeeper()
        self.assertEqual( robot._UrRobot__beepers, infinity, "Robot lacks infinite beepers")
        
    def testIllegalCorner(self):
        "Various tests of illegal ccorner uses"
        self.assertRaises(IllegalCorner, Robot, 0, 1, North, 0)
        self.assertRaises(IllegalCorner, world.placeBeepers, 1, 0, 2)
        
    def testPickBeeper(self):
        "Picking beepers and putting them again"
        world.placeBeepers(5, 5, 3)
        self.assertNoBeepersInBeeperBag(self.karel)
        self.karel.pickBeeper()
        self.assertBeepersInBeeperBag(self.karel)
        self.karel.pickBeeper()
        self.assertEqual( self.karel._UrRobot__beepers, 2, "Wrong number of beepers")
        self.karel.putBeeper()
        self.assertEqual( self.karel._UrRobot__beepers, 1, "Wrong number of beepers")
        self.karel.putBeeper()
        self.assertNoBeepersInBeeperBag(self.karel)
        
    def testPutBeeperWhenNonePresent(self):
        "Trying to put a beeper when none in bag"
        self.assertRaises(NoBeepersInBeeperBag, self.karel.putBeeper)
        
    def testPickBeeperWhenNonePresent(self):
        "Trying to pick a beeper when none on corner"
        self.assertRaises(Exception, self.karel.pickBeeper)
        
    def testAssertionStructure(self):
        "Assure the robottestcase assertions all work"
        self.assertRunning(self.karel)
        self.assertFacingNorth(self.karel)
        self.assertNotFacingEast(self.karel)
        self.assertNotFacingSouth(self.karel)
        self.assertNotFacingWest(self.karel)
        self.assertNoBeepersInBeeperBag(self.karel)
        self.assertAt(self.karel, 5, 5)
        self.assertNotAt(self.karel, 4, 7)
        self.assertOnAvenue(self.karel, 5)
        self.assertOnStreet(self.karel, 5)
        self.assertNotOnAvenue(self.karel, 6)
        self.assertNotOnStreet(self.karel, 3)
        self.assertNotNextToABeeper(self.karel)
        self.assertRaises(RobotException, self.assertNotRunning, self.karel)
        self.assertRaises(RobotException, self.assertNotFacingNorth, self.karel)
        self.assertRaises(RobotException, self.assertFacingEast, self.karel)
        self.assertRaises(RobotException, self.assertFacingWest, self.karel)
        self.assertRaises(RobotException, self.assertFacingSouth, self.karel)
        self.assertRaises(RobotException, self.assertBeepersInBeeperBag, self.karel)
        self.assertRaises(RobotException, self.assertNextToABeeper, self.karel)
                
def suite():
    return unittest.makeSuite(RobotaTest)

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(suite())
