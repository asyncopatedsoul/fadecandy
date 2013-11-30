(function (window, undefined) {

   var deviceTypes = {
    'fadecandy': {
      pins: [
        {
          firstOutputPixel: 0,
          maxPixels: 64
        },
        {
          firstOutputPixel: 64,
          maxPixels: 64
        },
        {
          firstOutputPixel: 128,
          maxPixels: 64
        },
        {
          firstOutputPixel: 192,
          maxPixels: 64
        },
        {
          firstOutputPixel: 256,
          maxPixels: 64
        },
        {
          firstOutputPixel: 320,
          maxPixels: 64
        },
        {
          firstOutputPixel: 384,
          maxPixels: 64
        },
        {
          firstOutputPixel: 448,
          maxPixels: 64
        }
      ],
      maxPixels: 512
    }
  }

  function $fc(properties)
  {
    if (window === this) 
      return new $fc(properties);

    return this;
  };

  $fc.fn = $fc.prototype;

  $fc.fn.Module = function(config)
  {
    var height = config.height;
    var width = config.width;
    var isZigZag = config.zigzag;
    var pixels = [];

    init();

    function init()
    {
      for (var y=0;y<height;y++){

        for (var x=0;x<width;x++){
          var p;
          var mirrorX = width-(x+1);

          if (isZigZag&&y%2==1){
            p = new $fc.fn.Pixel(mirrorX,y);
          } else {
            p = new $fc.fn.Pixel(x,y);
          }

          pixels.push(p);
        }
      }
    }

    var public = {
      pixels: function()
      {
        return pixels;
      },
      height: function()
      {
        return height;
      },
      width: function()
      {
        return width;
      }
    }

    return public;
  }// end Module

  $fc.fn.Pixel = function(x,y) {
    var x = x;
    var y = y;

    var public = {
      coordinate: {
        x: x,
        y: y
      }
    }

    return public;
  }//end Pixel

  $fc.fn.Device = function(config)
  {
    var type = config.type;
    var isEvenWiring = config.evenwiring;
    var pins = deviceTypes[type].pins;
    var modules = [];
    var map = [];
    var devicePixels = [];

    var channel = 0;

    var public = {
      map: function()
      {
        return map;
      },
      pixels: function()
      {
        return devicePixels;
      }
    };

    public.addModule = function(module)
    {
      modules.push(module);
    }

    public.makeMapping = function(channelPixelOffset)
    {
      map = [];
      var channelPixelOffset = channelPixelOffset;

      if (modules.length<1)
        return;

      pins.forEach(function(pin){
        pin.pixels = [];
      });

      modules.forEach(mapPixelsToModule);
      pins.forEach(outputPinMapping);

      function mapPixelsToModule(module)
      {
        var pixels = module.pixels();
        var pixelIndex = 0;

        pins.forEach(mapPixelToPin);
        channelPixelOffset+=pixelIndex;

        function mapPixelToPin(pin)
        { 
          if (pin.pixels.length>0)
            return;

          pin.firstChannelPixel = pixelIndex+channelPixelOffset;

          for (var i=0;i<pin.maxPixels;i++)
          {
            //skip to next pin if remaining pixels for pin less than module width
            if (i%module.width()==0&&pin.maxPixels-i<module.width())
              return;

            if (pixelIndex==pixels.length)
              return; //clear map for next module, if any

            devicePixels.push(pixels[pixelIndex]);
            pin.pixels.push(pixels[pixelIndex]);
            pixelIndex++;
          }

        }

      }

      function outputPinMapping(pin,pinIndex)
      {
        if (pin.pixels.length>0){
          pinMapping = [channel, pin.firstChannelPixel, pin.firstOutputPixel, pin.pixels.length];
          map.push(pinMapping);
        }
      }

    }

    return public;
  }//end Device

  $fc.fn.System = function(config)
  {
    var devices = [];
    var host = config.host;
    var port = config.port;

    var public = {};

    public.addDevice = function(device)
    {
      devices.push(device);
    }

    public.configuration = function()
      {
        deviceMapCache = [];
        channelPixelOffset = 0;
        devices.forEach(mapAllDevices);

        function mapAllDevices(device){

          device.makeMapping(channelPixelOffset);

          deviceMapCache.push({
            type: device.type,
            map: device.map()
          });

          channelPixelOffset+=device.pixels().length;
        }

        return {
          "listen": [host, port],
          "verbose": true,
          "color": {
              "gamma": 2.5,
              "whitepoint": [1.0, 1.0, 1.0]
          },
          "devices": deviceMapCache
        }
      }

    return public;
  }//end System

  window.$fc = new $fc();
})(window);