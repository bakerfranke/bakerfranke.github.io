    
'''Copyright 2012 Joseph Bergin
    #License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License
'''
 
from tkinter import Tk
from tkinter import mainloop
from tkinter import Frame
from tkinter import Label
from tkinter import Frame
from tkinter import Button
from tkinter import Canvas
from tkinter import Scale
from tkinter import IntVar
from tkinter import Menu
import karel.robota

#globalgraphical = True
#globalworld_maker_size = 12 if globalworld_maker_size == None
    
'''
    Each tool will drop the corresponding item at the mouse click location.
    Control click will remove an item if present (one beeper or a wall)
    Shift click will remove all beepers on the corner
    If there are no beepers on the corner then control click with the beeper tool places infinitely many there.
    If there are no beepers on the corner then control click with the beeper tool places infinitely many there.
    # A GUI to create and save world files
'''
class WorldMaker ( Frame):
    
    def __init__(self):
        super()
        self.dirty = False
        global dialog
        dialog = TkToplevel.new(self)
#        {
#        title ' World Creator '
#        }
        global globalinset
        globalinset = 25
        dialog.raise_window(globalwindow)
        global globalworld
        globalworld = RobotWorld("Karel's World Builder")
        geometry_string = '200x' + '300' + "+900+25"
        dialog.geometry(newGeometry = geometry_string)
        
        TkGrid.rowconfigure(dialog, 2, weight = 1)
        TkGrid.columnconfigure(dialog, 0, weight = 1)
        
        get_file = TkButton.new(dialog, text = "Get File", command = lambda: open_file)
        get_file.grid(row = 0, column = 0)
        self.show_file = TkEntry.new(dialog, state = disabled)
        self.show_file.grid(row = 1, column = 0, sticky = "ew")
        put_file = TkButton.new(dialog, text = "Save File", command = lambda: save_file)
        put_file.grid(row = 2, column = 0, sticky = 'n')
        self.text = TkLabel.new(dialog, text = "Tool")
        self.text.grid(row = 3, column = 0)
        self.beeper = TkButton.new(dialog, text = "Beeper", command = lambda: place_beeper, activeforeground = 'red')
        self.beeper.grid(row = 4, column = 0)
        horizontal_wall = TkButton.new(dialog, text = "EW Wall", command = lambda: east_west_wall)
        horizontal_wall.grid(row = 5, column = 0)
        vertical_wall = TkButton.new(dialog, text = "NS Wall", command = lambda: north_south_wall)
        vertical_wall.grid(row = 6, column = 0)
        global globalinstance
        globalinstance = self
        rescue
        print( e.to_s)
        print( e.backtrace)

    
    def dirty(self):
        self.dirty = True

    
    def check_dirty(self):
        if self.dirty:
            save_file()
            self.dirty = False
            exit()


    
    private
    def place_beeper(self):
        # self.beeper.flash
        self.current_scaler = BeeperScaler.instance
        globalwindow.cursor("dot")
        globalwindow.canvas.bind("1", lambda e: self.current_scaler.drop_item(e.x, e.y))
        globalwindow.canvas.bind("Control-Button-1", lambda e: self.current_scaler.remove(e.x, e.y, False))
        globalwindow.canvas.bind("Shift-Button-1", lambda e: self.current_scaler.remove(e.x, e.y, True))
        self.text.configure(text = "Beeper Tool")
        # puts 'beeper'

    
    def east_west_wall(self):
        # puts 'e w wall'
        self.current_scaler = HorizontalWallScaler.instance
        globalwindow.cursor("top_side")
        globalwindow.canvas.bind("1", lambda e: self.current_scaler.drop_item(e.x, e.y))
        globalwindow.canvas.bind("Control-Button-1", lambda e: self.current_scaler.remove(e.x, e.y, True))
        globalwindow.canvas.bind("Shift-Button-1", lambda e:()) #nothing
        self.text.configure(text = "EW Wall Tool")

    
    def north_south_wall(self):
        # puts 'n s wall'
        self.current_scaler = VerticalWallScaler.instance
        globalwindow.cursor("right_side")
        globalwindow.canvas.bind("1", lambda e: self.current_scaler.drop_item(e.x, e.y))
        globalwindow.canvas.bind("Control-Button-1", lambda e: self.current_scaler.remove(e.x, e.y, True))
        globalwindow.canvas.bind("Shift-Button-1", lambda e:())
        self.text.configure(text = "NS Wall Tool")

    
    def open_file(self):
        try :
            file = Tk.getOpenFile
            if file:
                globalworld.read_world(file)
                self.show_file.configure(state = "normal")
                self.show_file.insert(0, file)
                self.show_file.configure(state = "disabled")

        except Exception as e:
        # puts e.to_s
        # puts e.backtrace
            print( "No file selected")

    
    def save_file(self):
        try:
            file = Tk.getSaveFile
            if file:
                globalworld.save_world(file)
            # puts file
            # self.show_file.configure(state = :normal)
            # self.show_file.delete(0, file.size + 1)
            # self.show_file.configure(state = :disabled)
                print("file saved: " + file.to_s)
                self.dirty = False

        except Exception as e:
        # puts e.to_s
        # puts e.backtrace
            print ("No file selected")

    
    private
    
class BeeperScaler(object):
    
    self.self.instance = BeeperScaler.new
    
    def BeeperScaler.instance(self):
        return self.self.instance

    
    
    def scale(self,x, y):
        factor = globalwindow.scale_factor
        factor = 1 if factor == 0
        return ((x - globalinset + factor/2)/factor ).to_i, ((globalwindow_bottom - globalinset - y + factor/2)/factor).to_i

    
    def drop_item(self,x, y):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        # puts street.to_s + ' ' + avenue.to_s
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        globalworld.place_beepers(street, avenue, 1)
        globalinstance.dirty()

    
    def remove(self,x, y, all):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        # puts street.to_s + ' ' + avenue.to_s
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        if all:
            globalworld.remove_all_beepers(street, avenue)
            canvas.update
        else:
            if globalworld.beepers_at?(street, avenue):
                globalworld.remove_beeper(street, avenue)
            else:
                globalworld.place_beepers(street, avenue, -1)


        globalinstance.dirty()

    

    
class HorizontalWallScaler(object):
    
    self.self.instance = HorizontalWallScaler.new
    
    def HorizontalWallScaler.instance(self):
        return self.self.instance

    
    def scale(self,x, y):
        factor = globalwindow.scale_factor
        factor = 1 if factor == 0
        return ((x - globalinset + factor/2)/factor).to_i, ((globalwindow_bottom - globalinset - y ) / factor).to_i

    
    def drop_item(self,x, y):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        globalworld.place_wall_north_of(street, avenue)
        globalinstance.dirty()

    
    def remove(self,x, y, all):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        globalworld.remove_wall_north_of(street, avenue)
        globalinstance.dirty()


    
class VerticalWallScaler(object):
    
    self.self.instance = VerticalWallScaler.new
    
    def VerticalWallScaler.instance(self):
        return self.self.instance

    
    def scale(self,x, y):
        factor = globalwindow.scale_factor
        factor = 1 if factor == 0
        return ((x - globalinset)/factor).to_i, ((globalwindow_bottom - globalinset - y + factor/2) / factor).to_i

    
    def drop_item(self,x, y):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        globalworld.place_wall_east_of(street, avenue)
        globalinstance.dirty()

    
    def remove(self,x, y, all):
        canvas = globalwindow.canvas
        avenue, street = scale(x, y)
        if(street < 1 or avenue < 1 or street > globalwindow.number_of_streets() or avenue > globalwindow.number_of_streets()):
            return

        globalworld.remove_wall_east_of(street, avenue)
        globalinstance.dirty()

    
    # create the dialog and show it, along with a world
    def task(self):
        global globalmaker
        globalmaker = WorldMaker.new()
class ():
    def end_program(self,menu):
        globalinstance.check_dirty()


    
    rescue Exception => e
    puts e.to_s
    puts e.backtrace

    
    if __FILE__ == $0:
        global globalwindow
        globalwindow = window(globalworld_maker_size, 100)
        globalwindow.run do:
            task


