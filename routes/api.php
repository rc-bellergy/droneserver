<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/foo/{name}', function ($id) {
    return response()->json([
        'name' => $id,
        'email' => 'rc@bellergy.com',
    ]);
});


// Input two locations on lat1,lon1|lat2,lon2
// Return the max alt of the path
// Sample:
// http://droneserver.dq.hk/api/rtl-altitude/22.457401,114.368727|22.262165,114.271468

Route::get('/rtl-altitude/{path}', function ($path) {

    $api = "https://maps.googleapis.com/maps/api/elevation/json";
    $apikey = env('GOOGLE_MAP_API_KEY');

    $locations = explode("|", $path);
    $lat1 = explode(",",$locations[0])[0];
    $lon1 = explode(",",$locations[0])[1];
    $lat2 = explode(",",$locations[1])[0];
    $lon2 = explode(",",$locations[1])[1];
    if (($lat1 == $lat2) && ($lon1 == $lon2)) {
        $dist = 0;
    } else {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $dist = $dist * 60 * 1.1515 * 1.609344 *1000; // Metre
    }
    $samples = ceil($dist/20);
    if ($samples > 500) {
        $samples = 500; // The max Google accepts samples
    }
    $url = $api."?key=".$apikey."&path=".$path."&samples=".$samples;
    $response = file_get_contents($url);
    $response = json_decode($response);
    $max = max(array_map(function($o) {
        return $o->elevation;
    }, $response->results));
    $result["max_alt"] = $max;
    $result["total_dist"] = $dist;
    $result["sample_dist"] = $dist / $samples;

    return response()->json($result);
});
