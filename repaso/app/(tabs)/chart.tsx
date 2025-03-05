import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get("window").width;

const Chart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();

  console.log(params)

  useEffect(() => {
    fetchData();
  }, [])
  
  const fetchData = async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      const json = await res.json();
      setData(json.slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const barData = {
    labels: data.map((item) => item.id.toString()),
    datasets: [
      {
        data: data.map((item) => item.userId),
      }
    ]
  }

  const pieData = data.map((item) => ({
    name: `Post ${item.id}`,
    population: item.userId,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendColor: '#fff',
    legendFontSize: 15
  }));

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };

  return (
    <ScrollView style={{ padding: 16, marginTop: 16 }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View>
            <BarChart
              data={barData}
              width={screenWidth-32}
              height={220}
              yAxisLabel=''
              yAxisSuffix=''
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
              }}
            />
          </View>
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-2">Gráfico de Pastel (User IDs)</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
          <View>
            <Text>Bezier Line Chart</Text>
            <LineChart
              data={{
                labels: ["January", "February", "March", "April", "May", "June"],
                datasets: [
                  {
                    data: [
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100
                    ]
                  }
                ]
              }}
              width={Dimensions.get("window").width} // from react-native
              height={220}
              yAxisLabel="$"
              yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        </>
      )}
    </ScrollView>
  )
}

export default Chart