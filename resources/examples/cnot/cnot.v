module main_or_basic_code (input a, input b, output c);
 // OR logic gate
 
 assign c = a | b;
endmodule

module main_or (input v0e28cb, input v3ca442, output vcbab45);
 wire w0;
 wire w1;
 wire w2;
 assign w0 = v0e28cb;
 assign w1 = v3ca442;
 assign vcbab45 = w2;
 main_or_basic_code vf4938a (
   .a(w0),
   .b(w1),
   .c(w2)
 );
endmodule

module main_not_basic_code (input a, output c);
 // NOT logic gate
 
 assign c = ! a;
endmodule

module main_not (input v0e28cb, output vcbab45);
 wire w0;
 wire w1;
 assign w0 = v0e28cb;
 assign vcbab45 = w1;
 main_not_basic_code vd54ca1 (
   .a(w0),
   .c(w1)
 );
endmodule

module main_low_basic_code (output v);
 // Bit 0
 
 assign v = 1'b0;
endmodule

module main_low (output v608bd9);
 wire w0;
 assign v608bd9 = w0;
 main_low_basic_code v68c173 (
   .v(w0)
 );
endmodule

module main (input va1d1bb, output vecf2e3);
 wire w0;
 wire w1;
 wire w2;
 wire w3;
 assign w1 = va1d1bb;
 assign vecf2e3 = w3;
 main_not va44cd3 (
   .v0e28cb(w1),
   .vcbab45(w2)
 );
 main_or v0b7a71 (
   .v0e28cb(w0),
   .v3ca442(w2),
   .vcbab45(w3)
 );
 main_low v2d7478 (
   .v608bd9(w0)
 );
endmodule
