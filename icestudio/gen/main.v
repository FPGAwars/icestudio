// Generated verilog

module driver #(parameter B = 1'b0)(output o);
assign o = B;
endmodule

module main(output output11);
wire w0;
assign output11 = w0;
driver #(
  .B(1'b1)
 )
 driver10 (
  .o(w0)
);
endmodule
