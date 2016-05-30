module driver1x (output out);
 assign out = 1'b1;
endmodule

module highx (output out);
 wire w0;
 assign out = w0;
 driver1x d1 (
   .out(w0)
 );
endmodule

module notx (input in, output out);
 assign out = ! in;
endmodule

module lowx (output out);
 wire w0;
 wire w1;
 assign out = w1;
 highx h (
   .out(w0)
 );
 notx n (
   .in(w0),
   .out(w1)
 );
endmodule
