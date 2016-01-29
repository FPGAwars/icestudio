// Generated verilog

module andc(input in0, in1, output out0);
assign out0 = in0 & in1;
endmodule

module notc(input in0, output out0);
assign out0 = ! in0;
endmodule

module main(input in0, in1, output out0);
wire w0;
and and0 (
    .in0(0),
    .in1(0),
    .out0(w0)
);
not not1 (
    .in0(w0),
    .in1(out0)
);
endmodule
