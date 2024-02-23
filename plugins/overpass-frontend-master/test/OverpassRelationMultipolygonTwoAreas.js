const assert = require('assert').strict
const BoundingBox = require('boundingbox')

const OverpassRelation = require('../src/OverpassRelation')
const OverpassFrontend = require('..')
const testIntersects = require('../src/testIntersects')

const id = 'r7735480'
const example = {
  "type": "relation",
  "id": 7735480,
  "bounds": {
    "minlat": 48.2088526,
    "minlon": 16.3580268,
    "maxlat": 48.2123189,
    "maxlon": 16.3607470
  },
  "members": [
    {
      "type": "way",
      "ref": 28983071,
      "role": "outer",
      "geometry": [
         { "lat": 48.2120877, "lon": 16.3607470 },
         { "lat": 48.2118608, "lon": 16.3606813 },
         { "lat": 48.2117660, "lon": 16.3606538 },
         { "lat": 48.2113142, "lon": 16.3605197 },
         { "lat": 48.2111856, "lon": 16.3604815 },
         { "lat": 48.2110804, "lon": 16.3604503 },
         { "lat": 48.2108457, "lon": 16.3603807 },
         { "lat": 48.2107354, "lon": 16.3603474 },
         { "lat": 48.2107387, "lon": 16.3603305 },
         { "lat": 48.2107400, "lon": 16.3603149 },
         { "lat": 48.2107406, "lon": 16.3602947 },
         { "lat": 48.2107396, "lon": 16.3602672 },
         { "lat": 48.2107354, "lon": 16.3602441 },
         { "lat": 48.2107288, "lon": 16.3602219 },
         { "lat": 48.2107228, "lon": 16.3602071 },
         { "lat": 48.2107154, "lon": 16.3601917 },
         { "lat": 48.2107072, "lon": 16.3601786 },
         { "lat": 48.2106989, "lon": 16.3601694 },
         { "lat": 48.2106878, "lon": 16.3601577 },
         { "lat": 48.2106719, "lon": 16.3601466 },
         { "lat": 48.2106598, "lon": 16.3601436 },
         { "lat": 48.2106400, "lon": 16.3601410 },
         { "lat": 48.2106643, "lon": 16.3599611 },
         { "lat": 48.2106926, "lon": 16.3597517 },
         { "lat": 48.2106984, "lon": 16.3597088 },
         { "lat": 48.2107022, "lon": 16.3596797 },
         { "lat": 48.2107174, "lon": 16.3595645 },
         { "lat": 48.2107209, "lon": 16.3595381 },
         { "lat": 48.2107485, "lon": 16.3593292 },
         { "lat": 48.2107717, "lon": 16.3591566 },
         { "lat": 48.2108164, "lon": 16.3591499 },
         { "lat": 48.2108184, "lon": 16.3591758 },
         { "lat": 48.2108225, "lon": 16.3592009 },
         { "lat": 48.2108305, "lon": 16.3592177 },
         { "lat": 48.2108344, "lon": 16.3592248 },
         { "lat": 48.2108387, "lon": 16.3592325 },
         { "lat": 48.2108543, "lon": 16.3592499 },
         { "lat": 48.2108726, "lon": 16.3592616 },
         { "lat": 48.2108861, "lon": 16.3592655 },
         { "lat": 48.2109020, "lon": 16.3592627 },
         { "lat": 48.2109156, "lon": 16.3592581 },
         { "lat": 48.2109276, "lon": 16.3592491 },
         { "lat": 48.2109420, "lon": 16.3592317 },
         { "lat": 48.2109526, "lon": 16.3592117 },
         { "lat": 48.2109603, "lon": 16.3591879 },
         { "lat": 48.2109646, "lon": 16.3591606 },
         { "lat": 48.2109625, "lon": 16.3591316 },
         { "lat": 48.2109573, "lon": 16.3591050 },
         { "lat": 48.2109566, "lon": 16.3591016 },
         { "lat": 48.2110002, "lon": 16.3590749 },
         { "lat": 48.2110268, "lon": 16.3590587 },
         { "lat": 48.2110489, "lon": 16.3590382 },
         { "lat": 48.2110704, "lon": 16.3590241 },
         { "lat": 48.2110913, "lon": 16.3590060 },
         { "lat": 48.2111209, "lon": 16.3589792 },
         { "lat": 48.2111488, "lon": 16.3589473 },
         { "lat": 48.2111858, "lon": 16.3589032 },
         { "lat": 48.2111962, "lon": 16.3589190 },
         { "lat": 48.2112090, "lon": 16.3589342 },
         { "lat": 48.2112202, "lon": 16.3589445 },
         { "lat": 48.2112321, "lon": 16.3589507 },
         { "lat": 48.2112489, "lon": 16.3589572 },
         { "lat": 48.2112631, "lon": 16.3589569 },
         { "lat": 48.2112801, "lon": 16.3589486 },
         { "lat": 48.2112960, "lon": 16.3589306 },
         { "lat": 48.2113108, "lon": 16.3589085 },
         { "lat": 48.2113197, "lon": 16.3588833 },
         { "lat": 48.2113215, "lon": 16.3588603 },
         { "lat": 48.2113211, "lon": 16.3588377 },
         { "lat": 48.2113185, "lon": 16.3588181 },
         { "lat": 48.2113127, "lon": 16.3587981 },
         { "lat": 48.2113045, "lon": 16.3587785 },
         { "lat": 48.2112929, "lon": 16.3587651 },
         { "lat": 48.2112785, "lon": 16.3587514 },
         { "lat": 48.2113054, "lon": 16.3586906 },
         { "lat": 48.2114554, "lon": 16.3587346 },
         { "lat": 48.2115780, "lon": 16.3587706 },
         { "lat": 48.2120161, "lon": 16.3588991 },
         { "lat": 48.2120823, "lon": 16.3589185 },
         { "lat": 48.2123189, "lon": 16.3589879 },
         { "lat": 48.2120877, "lon": 16.3607470 }
      ]
    },
    {
      "type": "way",
      "ref": 8083397,
      "role": "outer",
      "geometry": [
         { "lat": 48.2101911, "lon": 16.3601023 },
         { "lat": 48.2101834, "lon": 16.3601215 },
         { "lat": 48.2101765, "lon": 16.3601456 },
         { "lat": 48.2101693, "lon": 16.3601812 },
         { "lat": 48.2099982, "lon": 16.3601300 },
         { "lat": 48.2099331, "lon": 16.3601107 },
         { "lat": 48.2097853, "lon": 16.3600669 },
         { "lat": 48.2096606, "lon": 16.3600300 },
         { "lat": 48.2090340, "lon": 16.3598444 },
         { "lat": 48.2090674, "lon": 16.3595790 },
         { "lat": 48.2088526, "lon": 16.3595128 },
         { "lat": 48.2088592, "lon": 16.3594632 },
         { "lat": 48.2088660, "lon": 16.3594112 },
         { "lat": 48.2090476, "lon": 16.3580268 },
         { "lat": 48.2092985, "lon": 16.3581002 },
         { "lat": 48.2093580, "lon": 16.3581176 },
         { "lat": 48.2096194, "lon": 16.3581940 },
         { "lat": 48.2096497, "lon": 16.3582029 },
         { "lat": 48.2098225, "lon": 16.3582534 },
         { "lat": 48.2099416, "lon": 16.3582882 },
         { "lat": 48.2100610, "lon": 16.3583224 },
         { "lat": 48.2100716, "lon": 16.3583912 },
         { "lat": 48.2100525, "lon": 16.3584049 },
         { "lat": 48.2100347, "lon": 16.3584231 },
         { "lat": 48.2100180, "lon": 16.3584466 },
         { "lat": 48.2100045, "lon": 16.3584743 },
         { "lat": 48.2099989, "lon": 16.3585071 },
         { "lat": 48.2100025, "lon": 16.3585385 },
         { "lat": 48.2100125, "lon": 16.3585631 },
         { "lat": 48.2100281, "lon": 16.3585846 },
         { "lat": 48.2100442, "lon": 16.3585963 },
         { "lat": 48.2100602, "lon": 16.3586023 },
         { "lat": 48.2100871, "lon": 16.3586037 },
         { "lat": 48.2101102, "lon": 16.3585975 },
         { "lat": 48.2101219, "lon": 16.3585898 },
         { "lat": 48.2101403, "lon": 16.3586459 },
         { "lat": 48.2101652, "lon": 16.3587046 },
         { "lat": 48.2102092, "lon": 16.3587901 },
         { "lat": 48.2102321, "lon": 16.3588337 },
         { "lat": 48.2102477, "lon": 16.3588544 },
         { "lat": 48.2102839, "lon": 16.3589021 },
         { "lat": 48.2102613, "lon": 16.3589405 },
         { "lat": 48.2102562, "lon": 16.3589661 },
         { "lat": 48.2102540, "lon": 16.3589943 },
         { "lat": 48.2102580, "lon": 16.3590275 },
         { "lat": 48.2102643, "lon": 16.3590486 },
         { "lat": 48.2102752, "lon": 16.3590677 },
         { "lat": 48.2102951, "lon": 16.3590902 },
         { "lat": 48.2103158, "lon": 16.3591003 },
         { "lat": 48.2103369, "lon": 16.3590996 },
         { "lat": 48.2103572, "lon": 16.3590922 },
         { "lat": 48.2103730, "lon": 16.3590772 },
         { "lat": 48.2103878, "lon": 16.3590553 },
         { "lat": 48.2103981, "lon": 16.3590259 },
         { "lat": 48.2104406, "lon": 16.3590553 },
         { "lat": 48.2104163, "lon": 16.3592340 },
         { "lat": 48.2103864, "lon": 16.3594421 },
         { "lat": 48.2103701, "lon": 16.3595742 },
         { "lat": 48.2103643, "lon": 16.3596103 },
         { "lat": 48.2103582, "lon": 16.3596546 },
         { "lat": 48.2103294, "lon": 16.3598625 },
         { "lat": 48.2103095, "lon": 16.3600400 },
         { "lat": 48.2102974, "lon": 16.3600372 },
         { "lat": 48.2102839, "lon": 16.3600357 },
         { "lat": 48.2102662, "lon": 16.3600385 },
         { "lat": 48.2102481, "lon": 16.3600464 },
         { "lat": 48.2102329, "lon": 16.3600527 },
         { "lat": 48.2102199, "lon": 16.3600636 },
         { "lat": 48.2102037, "lon": 16.3600833 },
         { "lat": 48.2101911, "lon": 16.3601023 }
      ]
    }
  ],
  "tags": {
    "leisure": "park",
    "name": "Rathauspark",
    "name:uk": "Ратуш парк",
    "start_date": "1873",
    "tourism": "attraction",
    "type": "multipolygon",
    "wikidata": "Q19971400",
    "wikimedia_commons": "Category:Rathauspark, Vienna",
    "wikipedia": "de:Rathauspark (Wien)"
  }
}

const boundingboxes = {
  'wrap': new BoundingBox({ minlon: 16, minlat: 48, maxlon: 17, maxlat: 49 }),
  'not wrap': new BoundingBox({ minlon: 16, minlat: 48, maxlon: 16.2, maxlat: 49 }),
  'between areas': new BoundingBox({ minlon: 16.359533071517944, minlat: 48.21044680425194, maxlon: 16.359715461730957, maxlat: 48.21058264759624 }),
  outside: new BoundingBox({ minlon: 16.35964035987854, minlat: 48.20887385507528, maxlon: 16.359769105911255, maxlat: 48.20895965354886 }),
  'inside area 1': new BoundingBox({ minlon: 16.359533071517944, minlat: 48.21149064385367, maxlon: 16.35987639427185, maxlat: 48.21169797932382 }),
  'intersect border of area 2': new BoundingBox({ minlon: 16.358073949813843, minlat: 48.209495890752116, maxlon: 16.35839581489563, maxlat: 48.209696084535224 }),
  'geojson wrap bbox': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.35563850402832, 48.211769474118874], [16.356271505355835, 48.20995347539216], [16.358814239501953, 48.20803016242876], [16.36239767074585, 48.20926709689881], [16.36106729507446, 48.21354966232839], [16.35563850402832, 48.211769474118874]]] } },
  'geojson between areas': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.35936141014099, 48.210557623849354], [16.359667181968685, 48.21044322942224], [16.35961890220642, 48.21062554541956], [16.35936141014099, 48.210557623849354]]] } },
  'geojson wrap': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.35764479637146, 48.21109026953561], [16.357752084732056, 48.20904545187872], [16.359790563583374, 48.208544959594924], [16.36114239692688, 48.21207690060018], [16.359028816223145, 48.212598806446685], [16.35764479637146, 48.21109026953561]]] } },
  'geojson in area': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.35868012905121, 48.20967821012213], [16.35937213897705, 48.209299271096185], [16.359538435935974, 48.209889127799215], [16.35868012905121, 48.20967821012213]]] } },
  'geojson cross boundary': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.359077095985413, 48.21052902526654], [16.35865330696106, 48.21031811022496], [16.3591468334198, 48.210125068578066], [16.359077095985413, 48.21052902526654]]] } },
  'geojson outside': { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[16.357483863830566, 48.20907762621533], [16.35766088962555, 48.20959241285238], [16.356963515281677, 48.2095530890557], [16.357483863830566, 48.20907762621533]]] } }
}


describe('OverpassRelation (multipolygon with separate areas)', function () {
  describe('with geometry', function () {
    const ob = new OverpassRelation(id)
    ob.overpass = new OverpassFrontend('')
    ob.updateData(example, { properties: 63 })

    it('intersect()', function () {
      const expected = {
        'wrap': 2,
        'not wrap': 0,
        'between areas': 0,
        'outside': 0,
        'inside area 1': 2,
        'intersect border of area 2': 2,
        'geojson wrap bbox': 2,
        'geojson between areas': 0,
        'geojson wrap': 2,
        'geojson in area': 2,
        'geojson cross boundary': 2,
        'geojson outside': 0
      }

      testIntersects({ ob, boundingboxes, expected })
    })
  })

  describe('with bounds only', function () {
    const ob = new OverpassRelation(id)
    ob.overpass = new OverpassFrontend('')
    let d = JSON.parse(JSON.stringify(example))
    d.members.forEach(m => delete m.geometry)
    ob.updateData(d, { properties: 7 })

    it('intersect()', function () {
      const expected = {
        'wrap': 2,
        'not wrap': 0,
        'between areas': 1,
        'outside': 1,
        'inside area 1': 1,
        'intersect border of area 2': 1,
        'geojson wrap bbox': 2,
        'geojson between areas': 1,
        'geojson wrap': 1,
        'geojson in area': 1,
        'geojson cross boundary': 1,
        'geojson outside': 0
      }

      testIntersects({ ob, boundingboxes, expected })
    })
  })
  describe('without geometry', function () {
    const ob = new OverpassRelation(id)
    ob.overpass = new OverpassFrontend('')
    let d = JSON.parse(JSON.stringify(example))
    d.members.forEach(m => delete m.geometry)
    delete d.bounds
    ob.updateData(d, { properties: 7 })

    it('intersect()', function () {
      const expected = {
        'wrap': 1,
        'not wrap': 1,
        'between areas': 1,
        'outside': 1,
        'inside area 1': 1,
        'intersect border of area 2': 1,
        'geojson wrap bbox': 1,
        'geojson between areas': 1,
        'geojson wrap': 1,
        'geojson in area': 1,
        'geojson cross boundary': 1,
        'geojson outside': 1
      }

      testIntersects({ ob, boundingboxes, expected })
    })
  })

  describe('without tags, properties 0', function () {
    const ob = new OverpassRelation('r7735480')
    ob.overpass = new OverpassFrontend('')
    let d = JSON.parse(JSON.stringify(example))
    delete d.tags
    ob.updateData(d, { properties: 0 })

    it('properties', function () {
      assert.equal(ob.properties, 60)
      assert.deepEqual(ob.tags, undefined)
    })
  })

  describe('without tags, but properties TAGS', function () {
    const ob = new OverpassRelation('r7735480')
    ob.overpass = new OverpassFrontend('')
    let d = JSON.parse(JSON.stringify(example))
    delete d.tags
    ob.updateData(d, { properties: OverpassFrontend.TAGS })

    it('properties', function () {
      assert.equal(ob.properties, 61)
      assert.deepEqual(ob.tags, {})
    })
  })
})
