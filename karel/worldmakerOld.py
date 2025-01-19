''' Copyright 2013 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License
 
Note that this worldbuilder makes world files compatible with the Python/Ruby/Java versions.

'''

from karel.robota import UrRobot
from karel.tkwindow import KarelWindow
from tkinter import Tk
from tkinter import mainloop
from tkinter import Label
from tkinter import Frame
from tkinter import Button
#from Tkinter import PhotoImage
from tkinter import Canvas
from tkinter import Scale
from tkinter import IntVar
from tkinter import Menu

class WorldMaker(Frame):
    
    def show(self):
        World.setVisible(1)
        builder = WorldBuilder(0)
        
    def setSize(self,streets, avenues):
        World.setSize(streets, avenues)
        
        
if __name__ == '__main__' :
    builder = WorldMaker()
    builder.setSize(12, 12)
    builder.show()