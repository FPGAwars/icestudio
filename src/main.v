// Generated verilog

module driver0x(output o0);
assign o0 = 1'b0;
endmodule

module main(output output12, output13);
wire w0;
wire w1;
assign output12 = w0;
assign output13 = w1;
assign w0 = w1;
driver0x driver011 (
    .o0(w0)
);
endmodule
