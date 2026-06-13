class Test:
    @property
    def radius(self):
        print("ceshi")
        return self._radius

    @radius.setter
    def radius(self, value):
        print("set")
        self._radius = value

    def __init__(self, value):
        self.radius = value


t = Test(1)
