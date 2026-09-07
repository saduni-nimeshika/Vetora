[Untitled Diagram (1).drawio](https://github.com/user-attachments/files/31921444/Untitled.Diagram.1.drawio)
# 🐾 Vetora - Veterinary Appointment & Pet Healthcare Management System

[![Status](https://img.shields.io/badge/Status-In%20Progress-yellow.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-Spring%20Boot%20%7C%20React.js%20%7C%20MySQL-blue.svg)](#)

**Vetora** is a centralized, web-based healthcare management platform designed to connect pet owners, veterinary doctors, and administrators. It digitalizes pet care operations by enabling location-based doctor discovery, online appointment scheduling, digital medical records, electronic prescriptions, and automated reminders.

---

## 🚀 Status: Under Development

This project is currently being actively developed as part of an academic requirement. Core modules including authentication, backend REST APIs, and database architecture are being implemented.

---

## ✨ Key Features

### 👤 Pet Owner
* **Pet Registration:** Create and manage pet profiles (species, breed, age, etc.).
* **Location-Based Search:** Find nearby veterinary clinics and doctors using integrated maps.
* **Online Booking:** Schedule appointments directly with preferred doctors[cite: 3].
* **Medical Records & Prescriptions:** View complete medical history and download digital prescriptions[cite: 3].
* **Automated Reminders:** Receive notifications for vaccinations, medications, and upcoming appointments[cite: 3].

### 🩺 Veterinary Doctor
* **Profile & Verification:** Register clinic location, specializations, and submit credentials for verification[cite: 3].
* **Appointment Management:** Accept, reject, or manage appointment slots[cite: 3].
* **E-Prescriptions & Records:** Issue electronic prescriptions and update medical history after consultations[cite: 3].

### 🛡️ Administrator
* **Doctor Verification:** Review and approve/reject veterinary registrations[cite: 3].
* **User & System Management:** Monitor appointments, oversee platform users, and view system reports[cite: 3].

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |<mxfile host="app.diagrams.net" agent="5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36">
  <diagram id="2YBvvXClWsGukQMizWep" name="Page-1">
    <mxGraphModel dx="882" dy="468" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-35" parent="1" style="rounded=0;whiteSpace=wrap;html=1;" value="" vertex="1">
          <mxGeometry height="215" width="570" x="80" y="275" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-7" edge="1" parent="1" style="endArrow=none;html=1;rounded=0;dashed=1;" target="XjCb4hcNxoY4Gd4qheaU-1" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <Array as="points">
              <mxPoint x="105" y="340" />
              <mxPoint x="105" y="300" />
              <mxPoint x="105" y="230" />
            </Array>
            <mxPoint x="105" y="470" as="sourcePoint" />
            <mxPoint x="107" y="107" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="aM9ryv3xv72pqoxQDRHE-1" parent="1" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=0;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="Web Interface" vertex="1">
          <mxGeometry height="440" width="100" x="240" y="40" as="geometry" />
        </mxCell>
        <mxCell id="aM9ryv3xv72pqoxQDRHE-2" parent="aM9ryv3xv72pqoxQDRHE-1" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="" vertex="1">
          <mxGeometry height="300" width="10" x="45" y="79" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-17" edge="1" parent="1" style="edgeStyle=elbowEdgeStyle;shape=wire;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;elbow=vertical;curved=0;dashed=1;" value="">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="469.70000000000005" y="145.20000000000005" as="sourcePoint" />
            <mxPoint x="615" y="145.20000000000005" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="aM9ryv3xv72pqoxQDRHE-5" parent="1" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=0;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="Appointment Controller" vertex="1">
          <mxGeometry height="300" width="100" x="420" y="40" as="geometry" />
        </mxCell>
        <mxCell id="aM9ryv3xv72pqoxQDRHE-6" parent="aM9ryv3xv72pqoxQDRHE-5" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="" vertex="1">
          <mxGeometry height="170" width="10" x="45" y="80" as="geometry" />
        </mxCell>
        <mxCell id="aM9ryv3xv72pqoxQDRHE-7" edge="1" parent="1" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" target="aM9ryv3xv72pqoxQDRHE-6" value="">
          <mxGeometry relative="1" x="0.8438" y="10" as="geometry">
            <mxPoint as="offset" />
            <Array as="points">
              <mxPoint x="530" y="138" />
            </Array>
            <mxPoint x="295" y="138.0000000000001" as="sourcePoint" />
            <mxPoint x="615" y="138.0000000000001" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-1" parent="1" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" value="Pet Owner" vertex="1">
          <mxGeometry height="60" width="30" x="90" y="30" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-5" parent="1" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="" vertex="1">
          <mxGeometry height="320" width="10" x="100" y="120" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-9" edge="1" parent="1" style="endArrow=classic;html=1;rounded=0;endFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="110" y="125" as="sourcePoint" />
            <mxPoint x="285" y="125" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-10" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="1.Enter email &amp;amp;password" vertex="1">
          <mxGeometry height="30" width="140" x="125" y="102" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-11" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="2.Submit login request" vertex="1">
          <mxGeometry height="30" width="135" x="315" y="115" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-19" edge="1" parent="1" style="edgeStyle=elbowEdgeStyle;shape=wire;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;elbow=vertical;curved=0;dashed=1;" value="">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="619.7" y="166.20000000000005" as="sourcePoint" />
            <mxPoint x="775" y="166.20000000000005" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-12" parent="1" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=0;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="Appointment Service" vertex="1">
          <mxGeometry height="300" width="100" x="570" y="40" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-13" parent="XjCb4hcNxoY4Gd4qheaU-12" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="" vertex="1">
          <mxGeometry height="146" width="10" x="45" y="92" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-14" parent="1" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=0;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="Database" vertex="1">
          <mxGeometry height="300" width="100" x="730" y="40" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-15" parent="XjCb4hcNxoY4Gd4qheaU-14" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};" value="" vertex="1">
          <mxGeometry height="95" width="10" x="45" y="117.5" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-18" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="3. validateCredentials&lt;div&gt;(email,passsword)&lt;/div&gt;" vertex="1">
          <mxGeometry height="60" width="100" x="490" y="90" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-20" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="4. Check user in database" vertex="1">
          <mxGeometry height="30" width="155" x="620" y="142" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-23" edge="1" parent="1" style="endArrow=none;html=1;rounded=0;dashed=1;startArrow=classic;startFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="625" y="240.99999999999994" as="sourcePoint" />
            <mxPoint x="775" y="240.99999999999994" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-24" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="5. Return user data" vertex="1">
          <mxGeometry height="30" width="110" x="650" y="218" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-25" edge="1" parent="1" source="aM9ryv3xv72pqoxQDRHE-6" style="endArrow=none;html=1;rounded=0;dashed=1;startArrow=classic;startFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="480" y="270" as="sourcePoint" />
            <mxPoint x="615" y="270" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-26" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="6. user data/null" vertex="1">
          <mxGeometry height="30" width="100" x="490" y="247" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-27" edge="1" parent="1" source="aM9ryv3xv72pqoxQDRHE-2" style="endArrow=none;html=1;rounded=0;dashed=1;startArrow=classic;startFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="300" y="290" as="sourcePoint" />
            <mxPoint x="465" y="290" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-28" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="7. Generate token &amp;amp;user role" vertex="1">
          <mxGeometry height="30" width="140" x="310" y="275" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-29" edge="1" parent="1" source="XjCb4hcNxoY4Gd4qheaU-5" style="endArrow=none;html=1;rounded=0;dashed=1;startArrow=classic;startFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="140" y="309.41" as="sourcePoint" />
            <mxPoint x="290" y="309.41" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-30" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="8. login success &amp;amp; redirect to dashboard" vertex="1">
          <mxGeometry height="30" width="155" x="117.5" y="292" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-31" edge="1" parent="1" style="endArrow=classic;html=1;rounded=0;dashed=1;startArrow=none;startFill=0;endFill=1;" target="aM9ryv3xv72pqoxQDRHE-1" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="110" y="370" as="sourcePoint" />
            <mxPoint x="260" y="370" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-32" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="7. login failed (invalid credentials" vertex="1">
          <mxGeometry height="30" width="135" x="120" y="353" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-33" edge="1" parent="1" source="XjCb4hcNxoY4Gd4qheaU-5" style="endArrow=none;html=1;rounded=0;dashed=1;startArrow=classic;startFill=1;" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <mxPoint x="140" y="420" as="sourcePoint" />
            <mxPoint x="290" y="420" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-34" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="show error message" vertex="1">
          <mxGeometry height="30" width="135" x="133" y="396" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-37" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="[if valid credentials]" vertex="1">
          <mxGeometry height="30" width="110" x="108" y="265" as="geometry" />
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-38" edge="1" parent="1" style="endArrow=none;html=1;rounded=0;dashed=1;entryX=1;entryY=0.25;entryDx=0;entryDy=0;" target="XjCb4hcNxoY4Gd4qheaU-35" value="">
          <mxGeometry height="50" relative="1" width="50" as="geometry">
            <Array as="points">
              <mxPoint x="320" y="330" />
            </Array>
            <mxPoint x="80" y="332" as="sourcePoint" />
            <mxPoint x="130" y="282" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="XjCb4hcNxoY4Gd4qheaU-39" parent="1" style="text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;" value="[if invalid credentials]" vertex="1">
          <mxGeometry height="30" width="135" x="99" y="324" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>

| **Backend Framework** | Java Spring Boot[cite: 3] |
| **Frontend Framework** | React.js[cite: 3] |
| **Database** | MySQL[cite: 3] |
| **API Architecture** | RESTful APIs[cite: 3] |
| **Location Service** | Google Maps API[cite: 3] |
| **Email Service** | JavaMail API[cite: 3] |
| **IDEs / Tools** | IntelliJ IDEA, VS Code, Git, GitHub[cite: 3] |

---

## 📐 System Architecture

### Entity Relationship Overview
The system database comprises key entities including **Users (Admins, Doctors, Pet Owners)**, **Pets**, **Appointments**, **Medical Records**, **Prescriptions**, and **Reminders**[cite: 3].
