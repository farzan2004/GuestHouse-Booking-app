import { LineChart, Label, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const ForecastChart = ({ data }) => {
    return (
        <LineChart
            width={650}
            height={320}
            data={data}
            margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
        >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

            {/* X Axis */}
            <XAxis
                dataKey="date"
                interval={0}
                angle={-20}
                textAnchor="end"
            >
                <Label
                    value="Date"
                    position="insideBottom"
                    offset={-10}
                />
            </XAxis>

            {/* Y Axis */}
            <YAxis domain={[5, 8]} ticks={[5, 6, 7, 8]}>
                <Label
                    value="Rooms Booked"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: "middle" }}
                />
            </YAxis>

            <Tooltip />

            <Line
                type="linear"
                dataKey="demand"
                stroke="#1f2937"
                strokeWidth={1}
                dot={{ r: 3 }}
            />
        </LineChart>
    );
}