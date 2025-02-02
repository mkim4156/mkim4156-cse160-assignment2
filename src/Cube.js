class Cube{
    constructor(segment){
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
    }
  
    drawCube(matrix, color){
      var xy = this.position;
      var rgba = color;
      var size = this.size;
      this.matrix = matrix;

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Front of Cube
      drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ] );
      drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ] );

      // Pass the color of a point to u_FragColor uniform variables
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*.9, rgba[2]*.9, rgba[3])

      // Top of cube
      drawTriangle3D( [0,1,0, 0,1,1, 1,1,1] );
      drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] );

      // Left side of cube
      drawTriangle3D( [0,1,0, 0,1,1, 0,0,1] );
      drawTriangle3D( [0,0,0, 0,0,1, 0,1,0] );

      // Right side of cube
      drawTriangle3D( [1,1,0, 1,1,1, 1,0,1] );
      drawTriangle3D( [1,0,0, 1,1,0, 1,0,1] );

      // Bottom of cube
      drawTriangle3D( [0,0,0, 0,0,1, 1,0,0] );
      drawTriangle3D( [1,0,0, 1,0,1, 0,0,1] );
            
      // Other sides of cube top, bottom, left, right, back
      // <fill this in yourself>
    }
}
