package com.savorySwift.deliveryService.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class GoogleMapsUtil {

    private static final String API_KEY = "AIzaSyAp7nhzYT1ikujsgPxmZOVTGMhxb_8R6qA";

    public String getAddressFromCoordinates(double lat, double lng) {
        try {
            String apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
                    lat + "," + lng + "&key=" + API_KEY;

            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String inputLine;

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.toString());

            JsonNode results = rootNode.get("results");
            if (results != null && results.isArray() && results.size() > 0) {
                return results.get(0).get("formatted_address").asText();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
