"""
Useful functions and constants for getting info from robots esp. for writing tests.
"""
from karel.robota import world
from karel.robota import North
from karel.robota import West
from karel.robota import South
from karel.robota import East
from karel.robotworld import RobotWorld

direction_strings = {
    East: "East",
    North: 'North',
    West: "West",
    South: 'South'
}

def getStreet(robot):
    return robot._UrRobot__street

def getAvenue(robot):
    return robot._UrRobot__avenue

def getLocation(robot):
    return (robot._UrRobot__street, robot._UrRobot__avenue)

def getDirection(robot):
    return robot._UrRobot__direction

def getDirectionStr(robot):
    return direction_strings[robot._UrRobot__direction]

def _status_to_str(status):
    return (status[0], 
            status[1],
            direction_strings[status[2]],
            status[3])

def getBeepers(robot):
    return robot._UrRobot__beepers

def getStatus(robot):
    return (robot._UrRobot__street, 
            robot._UrRobot__avenue,
            robot._UrRobot__direction,
            robot._UrRobot__beepers)

def checkRobotEquals(robot, robot_tuple):
    return (robot._UrRobot__street == robot_tuple[0]
            and robot._UrRobot__avenue == robot_tuple[1]
            and robot._UrRobot__direction == robot_tuple[2]
            and robot._UrRobot__beepers == robot_tuple[3])

def get_world_diffs(robot_world, expected_world):
    """
    Compares the beeper state of two robot worlds.

    Args:
        robot_world: The first RobotWorld object.
        expected_world: The second RobotWorld object.

    Returns:
        dict: Differences in beeper states categorized as 'missing', 'extra', and 'mismatched'.
    """
    world_beepers_dict = robot_world.getAllBeepers()
    expected_beepers_dict = expected_world.getAllBeepers()

    # Reusing the comparison logic
    return get_beeper_diffs(world_beepers_dict, expected_beepers_dict)


def get_world_diffs_from_file(robot_world, expected_world_file):
    """
    Compares the current world state with the state described in a .kwld file.

    Args:
        current_world: The current RobotWorld object.
        expected_world_file (str): Path to the .kwld file describing the expected state.

    Returns:
        dict: Differences in beeper states categorized as 'missing', 'extra', and 'mismatched'.
    """
    # Parse the .kwld file into a new RobotWorld object
    expected_world = RobotWorld("Expected World")
    expected_world.readWorld(expected_world_file)

    # Use the world comparison function
    return get_world_diffs(robot_world, expected_world)
    
def get_beeper_diffs(world_beepers, expected_beepers):
    """
    Compares beepers in the current world state with those described in another world.

    Args:
        world_beepers (dict): Beeper positions and counts in the current world state.
        expected_beepers (dict): Beeper positions and counts from the .kwld file or another world.

    Returns:
        dict: 
            - 'diffs': True if differences exist, False otherwise.
            - 'allbeeperdiffs': A multiline string showing the side-by-side comparison.
    """
    differences_found = False
    comparison_lines = []

    # Add column headings
    header = (
        f"{' '.ljust(8)}|{'Your World'.center(15)}|{'Expected'.center(15)}\n"
        f"{'RESULT'.ljust(8)}| {'st  ave beeps'.ljust(13)} | {'st  ave beeps'.ljust(14)}"
    )
    separator = f"{'-' * 8}| {'-'*3} {'-'*3} {'-'*5} | {'-'*3} {'-'*3} {'-'*5}"
    comparison_lines.append(header)
    comparison_lines.append(separator)

    # Gather all unique positions from both dictionaries
    all_positions = set(world_beepers.keys()) | set(expected_beepers.keys())

    for position in sorted(all_positions):
        robot_count = world_beepers.get(position, None)
        expected_count = expected_beepers.get(position, None)

        if robot_count is None:  # Missing in robot world
            differences_found = True
            comparison_lines.append(
                f"{'MISSING'.ljust(8)}| {'_   _   _':<14}| "
                f"{f'{position[0]:<3} {position[1]:<3} {expected_count:<5}':<14}"
            )
        elif expected_count is None:  # Extra in robot world
            differences_found = True
            comparison_lines.append(
                f"{'EXTRA'.ljust(8)}| "
                f"{f'{position[0]:<3} {position[1]:<3} {robot_count:<5}':<14}| {'--  --  --':<14}"
            )
        elif robot_count != expected_count:  # Mismatched counts
            differences_found = True
            robot_count = str(robot_count)+"<<"
            comparison_lines.append(
                f"{'MISMATCH'.ljust(8)}| "
                f"{f'{position[0]:<3} {position[1]:<3} {robot_count:<5}':<14}| "
                f"{f'{position[0]:<3} {position[1]:<3} {expected_count:<5}':<14}"
            )
        else:  # Matches correctly
            comparison_lines.append(
                f"{'   -'.ljust(8)}| "
                f"{f'{position[0]:<3} {position[1]:<3} {robot_count:<5}':<14}| "
                f"{f'{position[0]:<3} {position[1]:<3} {expected_count:<5}':<14}"
            )

    return {
        'diffs': differences_found,
        'allbeeperdiffs': "\n".join(comparison_lines)
    }



def get_beeper_diffs_OLD(world_beepers, expected_beepers):
    """
    Compares beepers in the current world state with those described in another world.

    Args:
        world_beepers (dict): Beeper positions and counts in the current world state.
        expected_beepers (dict): Beeper positions and counts from the .kwld file or another world.

    Returns:
        dict: Differences categorized as 'missing', 'extra', and 'mismatched'.
    """
    differences = {
        'missing': {},  # Beepers in the file but not in the current world
        'extra': {},    # Beepers in the current world but not in the file
        'mismatched': {}  # Locations where counts differ
    }

    # Compare file beepers with world beepers
    for location, count in expected_beepers.items():
        if location not in world_beepers:
            differences['missing'][location] = count
        elif world_beepers[location] != count:
            differences['mismatched'][location] = {
                'your_world': world_beepers[location],
                'expected': count
            }

    # Find extra beepers in the current world
    for location, count in world_beepers.items():
        if location not in expected_beepers:
            differences['extra'][location] = count

    return differences