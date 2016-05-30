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
