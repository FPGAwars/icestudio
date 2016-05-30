module andx (input a, b, output out);
 assign out = a & b;
endmodule

module and_wraperx (input x, y, output o);
 wire w0;
 wire w1;
 wire w2;
 assign w0 = x;
 assign w1 = y;
 assign o = w2;
 andx a (
   .a(w0),
   .b(w1),
   .out(w2)
 );
endmodule
