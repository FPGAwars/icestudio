module driver_driver0x (output out);
 assign out = 1'b0;
endmodule

module logic_andx (input a, b, output out);
 assign out = a & b;
endmodule

module zerox (input vbffc5a, output v3665d6);
 wire w0;
 wire w1;
 wire w2;
 assign w1 = vbffc5a;
 assign v3665d6 = w2;
 driver_driver0x v5c7238 (
   .out(w0)
 );
 logic_andx vd9491b (
   .a(w0),
   .b(w1),
   .out(w2)
 );
endmodule
