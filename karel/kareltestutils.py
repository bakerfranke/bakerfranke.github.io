# generic value v. expected test
from karel.robota import *
import karel.robotutils as util

def testEquals(test_name, test_desc, value, expected, showFailOnly=False):
    result = True
    if value != expected:
        result = False
    
    # default show fail tests, but also 
    if result == False or showFailOnly==False:
        print(testResultStr(test_name, test_desc, value, expected, result))
    
    return result

# use this to produce standard output string for a tests
def testResultStr(test_name, test_desc, value, expected, result):
    return  (
            f"{'-'*70}\n"
            f"TEST: {test_name}\n"
            f"{test_desc}\n"
            f"     Value: {value}\n"
            f"  Expected: {expected}\n"
            f"      Pass: {result}\n"
            )

# check two robot statuses ignoring beepers
def testRobotEquals_ignoreBeeepers(test_name, robot_status_tuple, expected_status_tuple, verbose=True):
    test_desc = "Testing Robot Location and Direction (ignore beepers)"

    street = robot_status_tuple[0] == expected_status_tuple[0]
    ave = robot_status_tuple[1] == expected_status_tuple[1]
    dir = robot_status_tuple[2] == expected_status_tuple[2]

    result = street and ave and dir
    if result == False or verbose == True:
        print(testResultStr(test_name, 
                            test_desc, 
                            status_tuple_str(robot_status_tuple), 
                            status_tuple_str(expected_status_tuple), 
                            result))
    return result

def testRobotEquals(test_name, robot_status_tuple, expected_status_tuple, atLeastBeepers=False, verbose=True):
    test_desc = "Testing Robot Location, Direction"
    beeps_result = False
    if atLeastBeepers == True:
        test_desc += ", (at least) Beepers."
        beeps_result = robot_status_tuple[3] >= expected_status_tuple[3]
    else:
        test_desc += ", Beepers."   
        beeps_result = robot_status_tuple[3] == expected_status_tuple[3]


    loc_dir_result = (robot_status_tuple[0] == expected_status_tuple[0]
                    and robot_status_tuple[1] == expected_status_tuple[1]
                    and robot_status_tuple[2] == expected_status_tuple[2])
    
    # if loc,dir and beeps_result are true we pass, otherwise fail
    result = loc_dir_result and beeps_result

    if result == False or verbose == True:
        print(testResultStr(test_name,
                            test_desc, 
                            status_tuple_str(robot_status_tuple), 
                            status_tuple_str(expected_status_tuple), 
                            result))

    return result

def status_tuple_str(tup):
    if tup[2] == North:
        dirstr = "North"
    if tup[2]==East:
        dirstr = "East"
    elif tup[2]==West:
        dirstr = "West"
    else:
        dirstr = "South"

    return f"(st: {tup[0]:2d}, ave: {tup[1]:2d}, dir: {dirstr:5s}, beeps: {tup[3]})"

def testClassMethodExists(classname, expectedMethod):
    #expectedMethod = "MileWalker.turnRight()"
    hasMethod = f"Not defined <{expectedMethod}()> "

    if hasattr(classname, expectedMethod):
        hasMethod = expectedMethod+"()"
    
    result = testEquals(f"Method check",
                        f"Does {classname} defines method {expectedMethod}()?",
                        hasMethod,
                        expectedMethod+"()")
    return result

def testWorldEquals(test_name, robot_world:RobotWorld, world_kwld_file:str):
    diffs = util.get_world_diffs_from_file(robot_world, world_kwld_file)
    
    display_str = (f"{'-'*70}\n"
                  f"TEST: {test_name}")
    display_str += "\nComparing beeper locations and counts in your world v. expected\n"

    if diffs['diffs'] == True:
        display_str += "DIFFERENECS...\n"
        display_str += diffs['allbeeperdiffs']
    else:
        display_str += "RESULT: Your world matches expected world! (Yay)"

    print(display_str)
    return diffs['diffs']==False