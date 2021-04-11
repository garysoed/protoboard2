# New version

## Objects

There are 4 general of objects:

-   **Face**: Represents a printable display.
-   **Piece**: Corresponds to a game piece. These are usually printable pieces and have multiple
    faces.
-   **Region**: A collection of pieces.

### Face

Faces are printable display of a piece. Each face can be zoomed in using `<pb-lens>`. All faces
support a `Layout` property, to arrange the regions on it. The layout types are specified in the
Face's state object.

```
<pb-face
    state-id <-- Links to state information of the face -->
    height <-- Height to display this face. -->
    width <-- Width to display this face -->>
  <div slot="display">
    <!-- The component to display. This should not depend on outer CSS to be displayed. -->
  </div>

  <!--
  Regions that should be displayed on the face. The slot names depend on the layout being used.
  -->
  <pb-region id="region1" slot="layout-x">
  </pb-region>
</pb-face>
```

### Piece

Pieces represent game pieces. They cannot contain other objects and are the fundamental building
blocks in a game. Pieces may have several faces and can switch between them. Some example pieces:

-   **D1**: A simple piece with only one face. For example: meeples, cubes, gems
-   **D2**: A piece with two faces. For example: cards and coins.
-   **D6**: A piece with six sides. For example: a d6 die.
-   **DN**: A piece with any specified number of sides.
-   **Board**: A special D1 that cannot be interacted with.

All pieces has a method to retrieve all faces for printing purposes.

### Region

A region can contain other pieces. They can be used to group pieces together. Some example regions:

-   **Slot**: Can contain only 1 piece.
-   **Surface**: Pieces can be placed in an x - y coordinate, based on the position of the mouse
    when adding the piece.
-   **Bag**: Puts in pieces, and you can only take out random items from the bag.
-   **Chute**: Mimics a cube tower. Put in pieces and they may randomly come out.
-   **Deck**: Pieces are stacked. They can be shuffled, reversed, cut. Only the top and bottom
    pieces can be revealed at a time.
-   **Hand**: A player's hand. Always arranges all the contents in horizontal order and allows
    random access to all its contents.


## Actions

A state changes its state using actions. Actions are triggered by objects, usually by user actions.



### Special

-   **Active**: Refers to the player's cursor. Only visible to the local player.

Deprecated:
-   **Slot**: A place where objects can be placed in it.
