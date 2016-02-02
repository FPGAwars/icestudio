// Generated verilog

module driver1x(output o0);
assign o0 = 1'b1;
endmodule

module driver0x(output o0);
assign o0 = 1'b0;
endmodule

module main(output output25, output29, output30, output31, output37);
wire w0;
wire w1;
wire w2;
wire w3;
wire w4;
assign w0 = output31;
assign w1 = output25;
assign w2 = output30;
assign w3 = output29;
assign w4 = output37;
driver1x driver123 (
    .o0(w0)
);
driver1x driver139 (
    .o0(w1)
);
driver1x driver140 (
    .o0(w2)
);
driver1x driver141 (
    .o0(w3)
);
driver0x driver043 (
    .o0(w4)
);
endmodule
