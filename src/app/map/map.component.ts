import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as L from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: any;
  private users: {
    id: number;
    friends: Array<number>;
    latitude: number;
    longitude: number;
  }[] = [];
  private lines:Array<L.Polyline> = [];

  ngOnInit(): void {
    // Create fake users
    for (let i = 1; i < 51; i++) {
      const numFriends = Math.floor(Math.random() * 11);
      let friends: Array<number> = [];
      for (let j = 0; j < numFriends; j++) {
        const randomFriendId = Math.floor(Math.random() * 50 + 1);
        if (friends.includes(randomFriendId) || randomFriendId === i) continue;
        friends.push(randomFriendId);
      }
      this.users.push({
        id: i,
        friends: friends,
        latitude:
          (Math.round(Math.random()) * 2 - 1) * Math.round(Math.random() * 91),
        longitude:
          (Math.round(Math.random()) * 2 - 1) * Math.round(Math.random() * 181),
      });
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      maxBoundsViscosity: 1,
      maxBounds: L.latLngBounds(L.latLng(-90, -180.1), L.latLng(90, 180.1)),
    });
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        minZoom: 1,
        maxZoom: 5,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    tiles.addTo(this.map);

    // Make a pin for each user
    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      const pin = L.marker(L.latLng(user.latitude, user.longitude), {
        icon: iconDefault,
      }).addTo(this.map);
      pin.on('click', (e) => {
        this.lines.forEach(item => this.map.removeLayer(item));
        this.lines = [];
        const friends = user.friends;
        const lineCoords = [
          L.latLng(user.latitude, user.longitude),
          L.latLng(0, 0),
        ];
        for (let j = 0; j < friends.length; j++) {
          lineCoords[1] = L.latLng(
            this.users[friends[j]].latitude,
            this.users[friends[j]].longitude
          );
          console.log(lineCoords);
          const line = L.polyline(lineCoords).addTo(this.map);
          this.lines.push(line);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView(L.latLng(latitude, longitude), 5);
        },
        () => {
          this.map.setView(L.latLng(0, 0), 1);
        }
      );
    } else {
      this.map.setView(L.latLng(0, 0), 1);
    }
    this.initMap();
  }
}
