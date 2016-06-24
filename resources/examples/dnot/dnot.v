module main_v54c3f4_v36a883_vf83e2f (output v);
 // Driver low
 assign v = 1'b0;
endmodule

module main_v54c3f4_v36a883 (output v608bd9);
 wire w0;
 assign v608bd9 = w0;
 main_v54c3f4_v36a883_vf83e2f v68c173 (
   .v(w0)
 );
endmodule

module main_v54c3f4_v557f25_vf83e2f (input a, output c);
 // NOT logic gate
 assign c = ! a;
endmodule

module main_v54c3f4_v557f25 (input v6c94be, output v3d2176);
 wire w0;
 wire w1;
 assign w0 = v6c94be;
 assign v3d2176 = w1;
 main_v54c3f4_v557f25_vf83e2f v158fc7 (
   .a(w0),
   .c(w1)
 );
endmodule

module main_v54c3f4_v175835_vf83e2f (input a, input b, output c);
 // OR logic gate
 assign c = a | b;
endmodule

module main_v54c3f4_v175835 (input v0e28cb, input v3ca442, output vcbab45);
 wire w0;
 wire w1;
 wire w2;
 assign w0 = v0e28cb;
 assign w1 = v3ca442;
 assign vcbab45 = w2;
 main_v54c3f4_v175835_vf83e2f vf4938a (
   .a(w0),
   .b(w1),
   .c(w2)
 );
endmodule

module main_v54c3f4 (input v39bf7c, output vdf78f0);
 wire w0;
 wire w1;
 wire w2;
 wire w3;
 assign w0 = v39bf7c;
 assign vdf78f0 = w3;
 main_v54c3f4_v36a883 v1ebf70 (
   .v608bd9(w1)
 );
 main_v54c3f4_v557f25 v8fdfe0 (
   .v6c94be(w0),
   .v3d2176(w2)
 );
 main_v54c3f4_v175835 v9eab13 (
   .v0e28cb(w1),
   .v3ca442(w2),
   .vcbab45(w3)
 );
endmodule

module main_v557f25_vf83e2f (input a, output c);
 // NOT logic gate
 assign c = ! a;
endmodule

module main_v557f25 (input v6c94be, output v3d2176);
 wire w0;
 wire w1;
 assign w0 = v6c94be;
 assign v3d2176 = w1;
 main_v557f25_vf83e2f v158fc7 (
   .a(w0),
   .c(w1)
 );
endmodule

module main (input v759eac, output v7a7776, output v7aa50c);
 wire w0;
 wire w1;
 wire w2;
 wire w3;
 assign w0 = v759eac;
 assign w1 = v759eac;
 assign v7aa50c = w2;
 assign v7a7776 = w3;
 assign w1 = w0;
 main_v54c3f4 v48565e (
   .v39bf7c(w1),
   .vdf78f0(w2)
 );
 main_v557f25 vef7948 (
   .v6c94be(w0),
   .v3d2176(w3)
 );
endmodule
