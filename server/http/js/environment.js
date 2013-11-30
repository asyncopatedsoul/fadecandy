var s = new $fc.System({
    host: "127.0.0.1",
    port: 7890
  });

  console.log(s);

  for (var a=0;a<2;a++){

    var d = new $fc.Device({type:'fadecandy',evenwiring:true});
    console.log(d);

    for (var i=0;i<4;i++){
      var m = new $fc.Module({height:8,width:8,zigzag:true});
      console.log(m);
      d.addModule(m);
    }

    s.addDevice(d);

  }
  
  console.log(JSON.stringify(s.configuration()));