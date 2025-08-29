import { useGetGarbageResidentPending } from "./queries/garbagePickupResidentFetchQueries";
import { View, FlatList } from "react-native";


export default function GarbagePending(){
    const {date: pending = [], isLoading} = useGetGarbageResidentPending()
    return(
        <View>

        </View>
    )
}