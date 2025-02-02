class Cube{
    constructor(segment){
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();

      this.buffer = null;
    }
  
    drawCube(matrix, color){
      var xy = this.position;
      var rgba = color;
      var size = this.size;
      this.matrix = matrix;

      if(this.buffer === null){
        this.buffer = gl.createBuffer();
        if(!this.buffer){
          console.log("Failed to create buffer object");
          return -1;
        }
      }

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      let v = [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0, 0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0, 0,1,0, 0,1,1, 1,1,1, 0,1,0, 1,1,1, 1,1,0, 0,1,0, 0,1,1, 0,0,1, 0,0,0, 0,0,1, 0,1,0, 1,1,0, 1,1,1, 1,0,1, 1,0,0, 1,1,0, 1,0,1, 0,0,0, 0,0,1, 1,0,0, 1,0,0, 1,0,1, 0,0,1 ]
      drawTriangle3D(this.buffer, v );
      // Front of Cube
      // drawTriangle3D(this.buffer, [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ] );
      // drawTriangle3D(this.buffer, [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ] );

      // Pass the color of a point to u_FragColor uniform variables
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*.9, rgba[2]*.9, rgba[3])

      // Top of cube
      // drawTriangle3D(this.buffer, [0,1,0, 0,1,1, 1,1,1] );
      // drawTriangle3D(this.buffer, [0,1,0, 1,1,1, 1,1,0] );

      // // Left side of cube
      // drawTriangle3D(this.buffer, [0,1,0, 0,1,1, 0,0,1] );
      // drawTriangle3D(this.buffer, [0,0,0, 0,0,1, 0,1,0] );

      // // Right side of cube
      // drawTriangle3D(this.buffer, [1,1,0, 1,1,1, 1,0,1] );
      // drawTriangle3D(this.buffer, [1,0,0, 1,1,0, 1,0,1] );

      // // Bottom of cube
      // drawTriangle3D(this.buffer, [0,0,0, 0,0,1, 1,0,0] );
      // drawTriangle3D(this.buffer, [1,0,0, 1,0,1, 0,0,1] );
            
      // Other sides of cube top, bottom, left, right, back
      // <fill this in yourself>
    }
}
