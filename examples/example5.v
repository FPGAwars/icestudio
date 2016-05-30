module driver0x (output out);
 assign out = 1'b0;
endmodule

module andx (input a, b, output out);
 assign out = a & b;
endmodule

module zerox (input in, output out);
 wire w0;
 wire w1;
 wire w2;
 assign w1 = in;
 assign out = w2;
 driver0x d0 (
   .out(w0)
 );
 andx a (
   .a(w0),
   .b(w1),
   .out(w2)
 );
endmodule
