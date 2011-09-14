package com.listomate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import com.listomate.models.Contact;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.SectionIndexer;
import android.widget.TwoLineListItem;

public class ContactArrayAdapter extends ArrayAdapter<Contact> implements SectionIndexer {	 
	
    private final int resourceId;
    ArrayList<Contact> myElements;
    HashMap<String, Integer> alphaIndexer;
    String[] sections;
 
    public ContactArrayAdapter(Context context, int textViewResourceId, List<Contact> objects) {
        super(context, textViewResourceId, objects);
        resourceId = textViewResourceId;
        myElements = (ArrayList<Contact>) objects;
        alphaIndexer = new HashMap<String, Integer>();
        int size = objects.size();
        for (int i = size - 1; i >= 0; i--) {
            Contact element = myElements.get(i);
            alphaIndexer.put(element.getName().substring(0, 1), i);
 
        }
        Set<String> keys = alphaIndexer.keySet();
        Iterator<String> it = keys.iterator();
        ArrayList<String> keyList = new ArrayList<String>();
        while (it.hasNext()) {
            String key = it.next();
            keyList.add(key);
        }
        Collections.sort(keyList);
        sections = new String[keyList.size()];
        keyList.toArray(sections);
    }
 
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
 
        Contact c = (Contact) getItem(position);
 
        // if the array item is null, nothing to display, just return null
        if (c == null) {
            return null;
        }
 
        // We need the layoutinflater to pick up the view from xml
        LayoutInflater inflater = (LayoutInflater)
        getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
 
        // Pick up the TwoLineListItem defined in the xml file
        TwoLineListItem view;
        if (convertView == null) {
            view = (TwoLineListItem) inflater.inflate(resourceId, parent, false);
        } else {
            view = (TwoLineListItem) convertView;
        }
 
        // Set value for the first text field
        if (view.getText1() != null) {
            view.getText1().setText(c.getName());
        }
 
        // set value for the second text field
        if (view.getText2() != null) {
            view.getText2().setText(c.getNumber());
        }
 
        return view;
    }
 
    public int getPositionForSection(int section) {
        String letter = sections[section];
        return alphaIndexer.get(letter);
    }
 
    public int getSectionForPosition(int position) {
        // TODO Auto-generated method stub
        return 0;
    }
 
    public Object[] getSections() {
        return sections;
    }
    
}
