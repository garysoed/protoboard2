import {assert, objectThat, should, test} from 'gs-testing';

import {Direction, distance, rectOrthogonal} from './rect-orthogonal';
import {testTile, TestTile} from './testing/test-tile';


test('@protoboard2/tiling/rect-orthogonal', init => {
  const _ = init(() => {
    const board = rectOrthogonal([
      testTile(-1, -5),
      testTile(1, 2),
      testTile(1, 3),
      testTile(1, 4),
      testTile(2, 2),
      testTile(2, 3),
      testTile(2, 4),
      testTile(3, 2),
      testTile(3, 3),
      testTile(3, 4),
    ]);

    return {board};
  });

  test('getAdjacentTilesAt', () => {
    should('return all adjacent tiles', () => {
      assert(_.board.getAdjacentTilesAt({x: 2, y: 3})).to.haveExactElements(new Map([
        [Direction.DOWN, objectThat<TestTile>().haveProperties(testTile(2, 4))],
        [Direction.UP, objectThat<TestTile>().haveProperties(testTile(2, 2))],
        [Direction.LEFT, objectThat<TestTile>().haveProperties(testTile(1, 3))],
        [Direction.RIGHT, objectThat<TestTile>().haveProperties(testTile(3, 3))],
      ]));
    });

    should('skip non existing tiles', () => {
      assert(_.board.getAdjacentTilesAt({x: 3, y: 4})).to.haveExactElements(new Map([
        [Direction.UP, objectThat<TestTile>().haveProperties(testTile(3, 3))],
        [Direction.LEFT, objectThat<TestTile>().haveProperties(testTile(2, 4))],
      ]));
    });
  });

  test('getTileAt', () => {
    should('return the correct tile', () => {
      assert(_.board.getTileAt({x: 2, y: 2})!).to.haveProperties(testTile(2, 2));
    });

    should('return null if tile does not exist', () => {
      assert(_.board.getTileAt({x: 0, y: 2})).to.beNull();
    });
  });

  test('getTileFrom', () => {
    should('return the correct tile for UP direction', () => {
      assert(_.board.getTileFrom({x: 3, y: 3}, Direction.UP)!).to.haveProperties(testTile(3, 2));
    });

    should('return null if destination does not exist', () => {
      assert(_.board.getTileFrom({x: 3, y: 2}, Direction.RIGHT)).to.beNull();
    });

    should('return the correct tile if origin does not exist but destination does', () => {
      assert(_.board.getTileFrom({x: 4, y: 2}, Direction.LEFT)!).to.haveProperties(testTile(3, 2));
    });
  });

  test('replaceTiles', () => {
    should('replace and add the tiles correctly', () => {
      const newBoard = _.board.replaceTiles([
        testTile(2, 3, 'replaced'),
        testTile(-2, -5, 'added'),
      ]);

      assert(_.board.getTileAt({x: 2, y: 3})!).to.haveProperties(testTile(2, 3));
      assert(_.board.getTileAt({x: -2, y: -5})).to.beNull();
      assert(newBoard.getTileAt({x: 2, y: 3})!).to.haveProperties({payload: 'replaced'});
      assert(newBoard.getTileAt({x: -2, y: -5})!).to.haveProperties({payload: 'added'});
    });
  });

  test('tiles', () => {
    should('include all tiles, including the ones with negative coordinates', () => {
      assert(_.board.tiles).to.haveExactElements(new Set([
        objectThat<TestTile>().haveProperties(testTile(-1, -5)),
        objectThat<TestTile>().haveProperties(testTile(1, 2)),
        objectThat<TestTile>().haveProperties(testTile(1, 3)),
        objectThat<TestTile>().haveProperties(testTile(1, 4)),
        objectThat<TestTile>().haveProperties(testTile(2, 2)),
        objectThat<TestTile>().haveProperties(testTile(2, 3)),
        objectThat<TestTile>().haveProperties(testTile(2, 4)),
        objectThat<TestTile>().haveProperties(testTile(3, 2)),
        objectThat<TestTile>().haveProperties(testTile(3, 3)),
        objectThat<TestTile>().haveProperties(testTile(3, 4)),
      ]));
    });
  });

  test('distance', () => {
    should('return the correct distance if dx is -ve and dy is -ve', () => {
      assert(distance({x: 1, y: 2}, {x: -1, y: -2})).to.equal(6);
    });

    should('return the correct distance if dx is -ve and dy is +ve', () => {
      assert(distance({x: 1, y: 2}, {x: -1, y: 4})).to.equal(4);
    });

    should('return the correct distance if dx is +ve and dy is -ve', () => {
      assert(distance({x: 1, y: 2}, {x: 3, y: -4})).to.equal(8);
    });

    should('return the correct distance if dx is +ve and dy is +ve', () => {
      assert(distance({x: 1, y: 2}, {x: 3, y: 4})).to.equal(4);
    });
  });
});