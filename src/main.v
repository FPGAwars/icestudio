// Generated verilog

module andx(input in0, in1, output out0);
assign out0 = in0 & in1;
endmodule

module notx(input in0, output out0);
assign out0 = ! in0;
endmodule

module main(input in0, in1, output out0);
wire w0;
andx and0 (
    .in0(in0),
    .in1(in1),
    .out0(w0)
);
notx not0 (
    .in0(w0),
    .out0(out0)
);
endmodule
