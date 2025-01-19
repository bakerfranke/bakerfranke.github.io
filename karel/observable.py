""" ICopyright 2008 Joseph Bergin
License: Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License

Implements both the observable and observer parts of the Observer Design Pattern

"""


class Observable :
    " Observers register with observable objects and then get notified whenever the observable changes state"
    
    def __init__(self):
        self.__observers = []
        self.__changed = False
    
    def addObserver(self, observer):
        "Add an observer to the set of objects to be notified of changes"
        if not observer in self.__observers :
            self.__observers.append(observer)
        
    def deleteObservers(self):
        " Remove all observers"
        self.__observers = []
        
    def notifyObservers(self, data = None):
        "Notifiy all observers if the changed state is true"
        if self.hasChanged() :
            for observer in self.__observers :
                observer.update(self, data)
        self.clearChanged()
        
    def hasChanged(self):
        "Determine the changed state of the observable"
        return self.__changed
    
    def countObservers(self):
        "The number of registered observers"
        return len(self.__observers)
    
    def setChanged(self):
        "Indicate that the observable has changed"
        self.__changed = True
        
    def clearChanged(self):
        "Indicate that the changed state is false"
        self.__changed = False
        
    def deleteObserver(self, observer):
        "Remove a specific observer (if present)"
        if observer in self.__observers:
            self.__observers.remove(observer)


class Observer :
    "An interface defining how the observable will call back to the observer"
    
    def update(self, observable, data):
        "Called by the observable(s) with which this observer is registered whenever changes occur."
        raise NotImplementedError("Unimplemented observer")

    