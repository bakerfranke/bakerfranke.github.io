# Classes
color: #7e22ce
blurb: Your own types
signoff: Ask: "What is self in your methods?" and "Why do a and b keep separate trick counts?"


## Two dogs
type: predict
hint: Each object keeps its own copy of self.tricks.
explain: a.learn() runs twice on Rex and b.learn() once on Fido. Each Dog object has its own tricks count.

What does this print?

```python
class Dog:
    def __init__(self, name):
        self.name = name
        self.tricks = 0

    def learn(self):
        self.tricks += 1

a = Dog("Rex")
b = Dog("Fido")
a.learn()
a.learn()
b.learn()
print(a.name, a.tricks)
print(b.name, b.tricks)
```

```answer
Rex 2
Fido 1
```


## What is self?
type: choice
hint: Think about a.learn(). Inside learn, which dog should get the new trick?
explain: When you call a.learn(), Python passes a in as self, so self is the object the method was called on.

In `def learn(self):`, what is `self`?

- [ ] The `Dog` class itself
- [x] The object the method was called on
- [ ] A copy of the object
- [ ] Nothing. It's a keyword Python requires


## Rectangle
type: code
hint: Store the sizes in __init__ with self.width = width. Then each method can use self.width and self.height.
explain: The methods all use the values stored on self, so every Rectangle object works with its own sizes.

Write a class `Rectangle`:

- `Rectangle(width, height)` stores the sizes as `self.width` and `self.height`
- `area()` returns width × height
- `perimeter()` returns the distance around the outside
- `is_square()` returns `True` if the width and height are equal

```starter
class Rectangle:
    def __init__(self, width, height):
        pass


r = Rectangle(3, 4)
print(r.area(), r.perimeter(), r.is_square())
```

```tests
->  Rectangle(3, 4).width == 3,  "Store width as self.width in __init__."
->  Rectangle(3, 4).area() == 12
->  Rectangle(3, 4).perimeter() == 14
->  Rectangle(5, 5).is_square() == True
->  Rectangle(2, 7).is_square() == False
```

```solution
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def is_square(self):
        return self.width == self.height


r = Rectangle(3, 4)
print(r.area(), r.perimeter(), r.is_square())
```
