// Generated verilog

module notx(input i0, output o0);
assign o0 = ! i0;
endmodule

module main(input input10, output output13, output15);
wire w0;
wire w1;
assign w0 = 1'b0;
assign output13 = w1;
assign output15 = w1;
notx not12 (
    .i0(w0),
    .o0(w1)
);
endmodule
