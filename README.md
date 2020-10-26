# New version

## Overview

The new protoboard will be driven by states. All changes will be done to the state, and the UI
will reflect changes to the state.

## States

A state represents the state of an object in the game. Every state consists of 3 parts:

```typescript
interface State {
  /**
   * Identifies the object. Must be globally unique.
   */
  readonly id: string;

  /**
   * Used to map to a function that generates the object.
   */
  readonly type: string;

  /**
   * Used to generate the object.
   */
  readonly payload: ReadonlyMap<string, Observable<unknown>>;
}
```

On setup, user must register a mapping from state to object:

```typescript
function registerStateHandler(
    type: string,
    onCreate: (id: string, payload: ReadonlyMap<string, unknown>) => Observable<Node>,
): void;
```

`onCreate` will only be called **once** - at the start of the game. For the rest of the game, no
object will ever be destroyed.

## Rendering

States are rendered using the element `<pb-render>`. This element takes one attribute: `object-id`.
At the start of the game, Protoboard will check the state for this object and render it.

## Actions

A state changes its state using actions. Actions are triggered by objects, usually by user actions.

## Object

There are 4 classes of objects:

-   **Region**: Denotes a region in a game that doesn't have a concrete representation.
-   **Piece**: Cannot contain other objects.

### Piece

Pieces represent game pieces. They cannot contain other objects and are the fundamental building
blocks in a game. Pieces may have several faces and can switch between them. Some example pieces:

-   **D1**: A simple piece with only one face. For example: meeples, cubes, gems
-   **D2**: A piece with two faces. For example: cards and coins.
-   **D6**: A piece with six sides. For example: a d6 die.
-   **DN**: A piece with any specified number of sides.

### Region

A region can contain other pieces. They can be used to group pieces together. Some example
regions:

-   **Bag**: Puts in pieces, and you can only take out random items from the bag.
-   **Chute**: Mimics a cube tower. Put in pieces and they may randomly come out.
-   **Deck**: Pieces are stacked. They can be shuffled, reversed, cut. Only the top and bottom
    pieces can be revealed at a time.
-   **Hand**: A player's hand. Always arranges all the contents in horizontal order and allows
    random access to all its contents.
-   **Surface**: Pieces can be placed in an x - y coordinate.

### Special

-   **Active**: Refers to the player's cursor. Only visible to the local player.

Deprecated:
-   **Slot**: A place where objects can be placed in it.
