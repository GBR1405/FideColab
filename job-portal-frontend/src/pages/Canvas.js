import React, { useEffect, useRef } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const data = {
      frames: {
        "stage00001.png": {
          "frame": {
            "x": 1,
            "y": 1,
            "w": 251,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 350
          },
          "sourceSize": {
            "w": 251,
            "h": 350
          }
        },
        "stage00002.png": {
          "frame": {
            "x": 254,
            "y": 1,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage00003.png": {
          "frame": {
            "x": 500,
            "y": 1,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage00004.png": {
          "frame": {
            "x": 740,
            "y": 1,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage00005.png": {
          "frame": {
            "x": 986,
            "y": 1,
            "w": 251,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 350
          },
          "sourceSize": {
            "w": 251,
            "h": 350
          }
        },
        "stage10001.png": {
          "frame": {
            "x": 1239,
            "y": 1,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage10002.png": {
          "frame": {
            "x": 1492,
            "y": 1,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage10003.png": {
          "frame": {
            "x": 1738,
            "y": 1,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage10004.png": {
          "frame": {
            "x": 1978,
            "y": 1,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage10005.png": {
          "frame": {
            "x": 2210,
            "y": 1,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage10006.png": {
          "frame": {
            "x": 2450,
            "y": 1,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage10007.png": {
          "frame": {
            "x": 1,
            "y": 353,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage20001.png": {
          "frame": {
            "x": 740,
            "y": 353,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage20002.png": {
          "frame": {
            "x": 254,
            "y": 353,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage20003.png": {
          "frame": {
            "x": 993,
            "y": 353,
            "w": 237,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 237,
            "h": 350
          },
          "sourceSize": {
            "w": 237,
            "h": 350
          }
        },
        "stage20004.png": {
          "frame": {
            "x": 1232,
            "y": 353,
            "w": 231,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 231,
            "h": 351
          },
          "sourceSize": {
            "w": 231,
            "h": 351
          }
        },
        "stage20005.png": {
          "frame": {
            "x": 1465,
            "y": 353,
            "w": 223,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 223,
            "h": 351
          },
          "sourceSize": {
            "w": 223,
            "h": 351
          }
        },
        "stage20006.png": {
          "frame": {
            "x": 2450,
            "y": 353,
            "w": 231,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 231,
            "h": 351
          },
          "sourceSize": {
            "w": 231,
            "h": 351
          }
        },
        "stage20007.png": {
          "frame": {
            "x": 1,
            "y": 706,
            "w": 237,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 237,
            "h": 350
          },
          "sourceSize": {
            "w": 237,
            "h": 350
          }
        },
        "stage20008.png": {
          "frame": {
            "x": 240,
            "y": 706,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage20009.png": {
          "frame": {
            "x": 486,
            "y": 706,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage30001.png": {
          "frame": {
            "x": 739,
            "y": 706,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage30002.png": {
          "frame": {
            "x": 992,
            "y": 706,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage30003.png": {
          "frame": {
            "x": 1238,
            "y": 706,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage30004.png": {
          "frame": {
            "x": 1478,
            "y": 706,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage30005.png": {
          "frame": {
            "x": 1710,
            "y": 706,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage30006.png": {
          "frame": {
            "x": 1936,
            "y": 706,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage30007.png": {
          "frame": {
            "x": 2154,
            "y": 706,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage30008.png": {
          "frame": {
            "x": 2380,
            "y": 706,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage30009.png": {
          "frame": {
            "x": 1,
            "y": 1059,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage30010.png": {
          "frame": {
            "x": 241,
            "y": 1059,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage30011.png": {
          "frame": {
            "x": 487,
            "y": 1059,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage40001.png": {
          "frame": {
            "x": 740,
            "y": 1059,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage40002.png": {
          "frame": {
            "x": 952,
            "y": 1059,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage40003.png": {
          "frame": {
            "x": 1170,
            "y": 1059,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage40004.png": {
          "frame": {
            "x": 1396,
            "y": 1059,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage40005.png": {
          "frame": {
            "x": 1628,
            "y": 1059,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage40006.png": {
          "frame": {
            "x": 1868,
            "y": 1059,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage40007.png": {
          "frame": {
            "x": 2114,
            "y": 1059,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage40008.png": {
          "frame": {
            "x": 2367,
            "y": 1059,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage40009.png": {
          "frame": {
            "x": 241,
            "y": 1411,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage40010.png": {
          "frame": {
            "x": 481,
            "y": 1411,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage40011.png": {
          "frame": {
            "x": 713,
            "y": 1411,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage40012.png": {
          "frame": {
            "x": 1868,
            "y": 1411,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage40013.png": {
          "frame": {
            "x": 2086,
            "y": 1411,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage50001.png": {
          "frame": {
            "x": 2298,
            "y": 1411,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        },
        "stage50002.png": {
          "frame": {
            "x": 2502,
            "y": 1411,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage50003.png": {
          "frame": {
            "x": 1,
            "y": 1758,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage50004.png": {
          "frame": {
            "x": 939,
            "y": 1759,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage50005.png": {
          "frame": {
            "x": 1165,
            "y": 1759,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage50006.png": {
          "frame": {
            "x": 1397,
            "y": 1759,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage50007.png": {
          "frame": {
            "x": 2086,
            "y": 1759,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage50008.png": {
          "frame": {
            "x": 2332,
            "y": 1759,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage50009.png": {
          "frame": {
            "x": 219,
            "y": 2110,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage50010.png": {
          "frame": {
            "x": 465,
            "y": 2110,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage50011.png": {
          "frame": {
            "x": 705,
            "y": 2110,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage50012.png": {
          "frame": {
            "x": 1637,
            "y": 1759,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage50013.png": {
          "frame": {
            "x": 1863,
            "y": 2110,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage50014.png": {
          "frame": {
            "x": 2332,
            "y": 2110,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage50015.png": {
          "frame": {
            "x": 2696,
            "y": 1,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        },
        "stage60001.png": {
          "frame": {
            "x": 2696,
            "y": 348,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        },
        "stage60002.png": {
          "frame": {
            "x": 2683,
            "y": 695,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage60003.png": {
          "frame": {
            "x": 2613,
            "y": 1043,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage60004.png": {
          "frame": {
            "x": 2585,
            "y": 1759,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage60005.png": {
          "frame": {
            "x": 937,
            "y": 2112,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage60006.png": {
          "frame": {
            "x": 1169,
            "y": 2112,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage60007.png": {
          "frame": {
            "x": 1409,
            "y": 2112,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage60008.png": {
          "frame": {
            "x": 2544,
            "y": 2112,
            "w": 251,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 251,
            "h": 349
          },
          "sourceSize": {
            "w": 251,
            "h": 349
          }
        },
        "stage60009.png": {
          "frame": {
            "x": 2081,
            "y": 2112,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage60010.png": {
          "frame": {
            "x": 1,
            "y": 2463,
            "w": 238,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 351
          },
          "sourceSize": {
            "w": 238,
            "h": 351
          }
        },
        "stage60011.png": {
          "frame": {
            "x": 241,
            "y": 2463,
            "w": 230,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 351
          },
          "sourceSize": {
            "w": 230,
            "h": 351
          }
        },
        "stage60012.png": {
          "frame": {
            "x": 473,
            "y": 2463,
            "w": 224,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 351
          },
          "sourceSize": {
            "w": 224,
            "h": 351
          }
        },
        "stage60013.png": {
          "frame": {
            "x": 699,
            "y": 2463,
            "w": 216,
            "h": 351
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 351
          },
          "sourceSize": {
            "w": 216,
            "h": 351
          }
        },
        "stage60014.png": {
          "frame": {
            "x": 1,
            "y": 2112,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage60015.png": {
          "frame": {
            "x": 2714,
            "y": 1396,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        },
        "stage70001.png": {
          "frame": {
            "x": 1655,
            "y": 2112,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        },
        "stage70002.png": {
          "frame": {
            "x": 1655,
            "y": 2463,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage70003.png": {
          "frame": {
            "x": 2327,
            "y": 2463,
            "w": 216,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 350
          },
          "sourceSize": {
            "w": 216,
            "h": 350
          }
        },
        "stage70004.png": {
          "frame": {
            "x": 2545,
            "y": 2463,
            "w": 224,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 350
          },
          "sourceSize": {
            "w": 224,
            "h": 350
          }
        },
        "stage70005.png": {
          "frame": {
            "x": 2900,
            "y": 1,
            "w": 230,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 350
          },
          "sourceSize": {
            "w": 230,
            "h": 350
          }
        },
        "stage70006.png": {
          "frame": {
            "x": 2900,
            "y": 353,
            "w": 238,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 350
          },
          "sourceSize": {
            "w": 238,
            "h": 350
          }
        },
        "stage70007.png": {
          "frame": {
            "x": 2895,
            "y": 705,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage70008.png": {
          "frame": {
            "x": 2811,
            "y": 1743,
            "w": 250,
            "h": 349
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 250,
            "h": 349
          },
          "sourceSize": {
            "w": 250,
            "h": 349
          }
        },
        "stage70009.png": {
          "frame": {
            "x": 2811,
            "y": 2094,
            "w": 244,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 244,
            "h": 350
          },
          "sourceSize": {
            "w": 244,
            "h": 350
          }
        },
        "stage70010.png": {
          "frame": {
            "x": 2797,
            "y": 2446,
            "w": 238,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 238,
            "h": 350
          },
          "sourceSize": {
            "w": 238,
            "h": 350
          }
        },
        "stage70011.png": {
          "frame": {
            "x": 2918,
            "y": 1057,
            "w": 230,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 230,
            "h": 350
          },
          "sourceSize": {
            "w": 230,
            "h": 350
          }
        },
        "stage70012.png": {
          "frame": {
            "x": 917,
            "y": 2798,
            "w": 224,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 224,
            "h": 350
          },
          "sourceSize": {
            "w": 224,
            "h": 350
          }
        },
        "stage70013.png": {
          "frame": {
            "x": 1143,
            "y": 2798,
            "w": 216,
            "h": 350
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 216,
            "h": 350
          },
          "sourceSize": {
            "w": 216,
            "h": 350
          }
        },
        "stage70014.png": {
          "frame": {
            "x": 1361,
            "y": 2798,
            "w": 210,
            "h": 346
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 210,
            "h": 346
          },
          "sourceSize": {
            "w": 210,
            "h": 346
          }
        },
        "stage70015.png": {
          "frame": {
            "x": 1867,
            "y": 2798,
            "w": 202,
            "h": 345
          },
          "rotated": false,
          "trimmed": false,
          "spriteSourceSize": {
            "x": 0,
            "y": 0,
            "w": 202,
            "h": 345
          },
          "sourceSize": {
            "w": 202,
            "h": 345
          }
        }
      },
      "meta": {
        "app": "http://www.codeandweb.com/texturepacker",
        "version": "1.0",
        "image": "spritesheet.png",
        "format": "RGBA8888",
        "size": {
          "w": 3149,
          "h": 3149
        },
        "scale": "1"
      }
    };

    const canvas = canvasRef.current;
    canvas.width = 250;
    canvas.height = 350;
    const context = canvas.getContext("2d");

    let frames = 0;
    let robot;

    class Sprite {
      constructor({ animations = [], data }) {
        this.animations = animations;
        this.animation = "stage1";
        this.frame = {};
        this.frameIndex = -1;
        this.data = data;
      }

      advance() {
        if (frames % 8 === 0) {
          this.frameNames = this.animations[this.animation].frames;

          if (this.frameIndex + 1 >= this.frameNames.length) {
            this.frameIndex = 0;
          } else {
            this.frameIndex++;
          }

          this.frame = this.data.frames[this.frameNames[this.frameIndex]].frame;
        }
      }
    }

    class Character extends Sprite {
      constructor(imageUrl, spriteObject, x, y, w, h) {
        super(spriteObject);
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || canvas.width;
        this.h = h || canvas.height;
        this.image = new Image();
        this.image.src = imageUrl;
      }

      draw() {
        this.advance();
        context.drawImage(
          this.image,
          this.frame.x,
          this.frame.y,
          this.frame.w,
          this.frame.h,
          this.x,
          this.y,
          this.w,
          this.h
        );
      }
    }

    robot = new Character("robot.png", {
      data,
      animations: {
        "stage7": {
          name: "stage7",
          frames: [
            "stage70001.png", 
            "stage70002.png", 
            "stage70003.png", 
            "stage70004.png", 
            "stage70005.png",
            "stage70006.png",
            "stage70007.png",
            "stage70008.png",
            "stage70009.png",
            "stage70010.png",
            "stage70011.png",
            "stage70012.png",
            "stage70013.png",
            "stage70014.png",
            "stage70015.png",
          ]
        },
        "stage6": {
          name: "stage6",
          frames: [
            "stage60001.png", 
            "stage60002.png", 
            "stage60003.png", 
            "stage60004.png", 
            "stage60005.png",
            "stage60006.png",
            "stage60007.png",
            "stage60008.png",
            "stage60009.png",
            "stage60010.png",
            "stage60011.png",
            "stage60012.png",
            "stage60013.png",
            "stage60014.png",
            "stage60015.png",
          ]
        },
        "stage5": {
          name: "stage5",
          frames: [
            "stage50001.png", 
            "stage50002.png", 
            "stage50003.png", 
            "stage50004.png", 
            "stage50005.png",
            "stage50006.png",
            "stage50007.png",
            "stage50008.png",
            "stage50009.png",
            "stage50010.png",
            "stage50011.png",
            "stage50012.png",
            "stage50013.png",
            "stage50014.png",
            "stage50015.png",
          ]
        },
        "stage4": {
          name: "stage4",
          frames: [
            "stage40001.png", 
            "stage40002.png", 
            "stage40003.png", 
            "stage40004.png", 
            "stage40005.png",
            "stage40006.png",
            "stage40007.png",
            "stage40008.png",
            "stage40009.png",
            "stage40010.png",
            "stage40011.png",
            "stage40012.png",
            "stage40013.png",
          ]
        },
        "stage3": {
          name: "stage3",
          frames: [
            "stage30001.png", 
            "stage30002.png", 
            "stage30003.png", 
            "stage30004.png", 
            "stage30005.png",
            "stage30006.png",
            "stage30007.png",
            "stage30008.png",
            "stage30009.png",
            "stage30010.png",
            "stage30011.png",
          ]
        },
        "stage2": {
          name: "stage2",
          frames: [
            "stage20001.png", 
            "stage20002.png", 
            "stage20003.png", 
            "stage20004.png", 
            "stage20005.png",
            "stage20006.png",
            "stage20007.png",
            "stage20008.png",
            "stage20009.png",
          ]
        },
        "stage1": {
          name: "stage1",
          frames: [
            "stage10001.png", 
            "stage10002.png", 
            "stage10003.png", 
            "stage10004.png", 
            "stage10005.png",
            "stage10006.png",
            "stage10007.png",
          ]
        },
        "stage0": {
          name: "stage0",
          frames: [
            "stage00001.png", 
            "stage00002.png", 
            "stage00003.png", 
            "stage00004.png", 
            "stage00005.png",
          ]
        }
      }
    });

    const update = () => {
      frames++;
      context.clearRect(0, 0, canvas.width, canvas.height);
      robot.draw();
      requestAnimationFrame(update);
    };

    update();

    const handleKeyDown = (e) => {
      if (e.key === "7") {
        robot.animation = "stage7";
      }
      if (e.key === "6") {
        robot.animation = "stage6";
      }
      if (e.key === "5") {
        robot.animation = "stage5";
      }
      if (e.key === "4") {
        robot.animation = "stage4";
      }
      if (e.key === "3") {
        robot.animation = "stage3";
      }
      if (e.key === "2") {
        robot.animation = "stage2";
      }
      if (e.key === "1") {
        robot.animation = "stage1";
      }
      if (e.key === "0") {
        robot.animation = "stage0";
      }
    };


    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default Canvas;
