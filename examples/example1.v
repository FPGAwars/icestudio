module example1_f9452a (output v);
 // Driver low
 assign v = 1'b0;
endmodule

module example1_main (output example1_ec9ea9);
 wire w0;
 assign example1_ec9ea9 = w0;
 example1_f9452a f9452a (
   .v(w0)
 );
endmodule
