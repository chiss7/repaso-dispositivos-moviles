import { Image, View } from 'react-native'

const SplashScreenView = () => {
  return (
    <View className='flex-1 justify-center items-center'>
      <View>
        <Image className='w-28 h-28 object-cover' source={require("@/assets/images/wiki-logo.png")} />
      </View>
    </View>
  );
}

export default SplashScreenView