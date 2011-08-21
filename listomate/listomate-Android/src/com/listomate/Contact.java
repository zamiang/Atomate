package com.listomate;

public class Contact implements Comparable {
	 
    private String Name;
    private String number;
 
    public String getName() {
        return Name;
    }
 
    public void setName(String Name) {
        this.Name = Name;
    }
 
    public String getNumber() {
        return number;
    }
 
    public void setNumber(String number) {
        this.number = number;
    }
 
    public int compareTo(Object arg0) {
        Contact newCont = (Contact)arg0;
        return this.Name.compareTo(newCont.getName());
    }
 
}