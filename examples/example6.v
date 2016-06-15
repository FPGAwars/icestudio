module custom_highx (output vce929a);
 wire w0;
 assign vce929a = w0;
 driver_driver1x vdfd4f7 (
   .out(w0)
 );
endmodule

module driver_driver1x (output out);
 assign out = 1'b1;
endmodule

module logic_notx (input in, output out);
 assign out = ! in;
endmodule

module lowx (output v6479a6);
 wire w0;
 wire w1;
 assign v6479a6 = w1;
 custom_highx v6eb3c6 (
   .vce929a(w0)
 );
 logic_notx vb9be04 (
   .in(w0),
   .out(w1)
 );
endmodule
