module main_v325b6b_vf83e2f (output v);
 // Driver low
 assign v = 1'b0;
endmodule

module main_v325b6b (output v608bd9);
 wire w0;
 assign v608bd9 = w0;
 main_v325b6b_vf83e2f v68c173 (
   .v(w0)
 );
endmodule

module main (output va7d04c, output v2866d8);
 wire w0;
 wire w1;
 assign va7d04c = w0;
 assign v2866d8 = w1;
 main_v325b6b vb59771 (
   .v608bd9(w0)
 );
 main_v325b6b v57e09b (
   .v608bd9(w1)
 );
endmodule
